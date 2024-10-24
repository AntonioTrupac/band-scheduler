'use server';

import { revalidateTag } from 'next/cache';

import connectMongo from '@/lib/mongodb';
import {
  Response,
  BandZodType,
  ZodBandSchema,
  ScheduleFormType,
  PickedZodCreateScheduleSchema,
} from '@/types/band';
import BandModel from '@/models/Band';
import StudioModel from '@/models/Studio';
import { hasTimeslotConflict, isStartBeforeEnd } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { getAuthedUserId } from '@/api/auth';
import { setRateLimit } from '@/api/upstash';
import { dataMapper } from '@/lib/dataMapper';
import { createRehearsals } from './bandActionHelpers';
import { unknown } from 'zod';
import mongoose from 'mongoose';

export const createBand = async (
  band: BandZodType,
): Promise<Response<BandZodType>> => {
  await connectMongo();
  const userId = getAuthedUserId();

  const validateBandSchema = ZodBandSchema.safeParse({
    ...band,
    createdBy: userId,
  });

  if (!validateBandSchema.success) {
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }

  try {
    await setRateLimit();

    const newBand = new BandModel({
      ...validateBandSchema.data,
      createdBy: userId,
    });
    await newBand.save();

    if (!newBand) {
      return {
        success: false,
        errors: { message: 'Failed to create band' },
      };
    }

    await StudioModel.findByIdAndUpdate(validateBandSchema.data.studioId, {
      $push: { bands: newBand._id },
    });

    revalidateTag('bands');

    return {
      success: true,
      data: dataMapper(newBand),
    };
  } catch (error) {
    console.error(error);
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 11000
    ) {
      const keyValue = (error as any).keyValue;
      if (keyValue && keyValue.name && keyValue.studioId) {
        return {
          success: false,
          errors: {
            message: 'A band with this name already exists in this studio',
          },
        };
      }
    }
    return {
      success: false,
      errors: { message: 'Failed to create or update band' },
    };
  }
};

const createExistingBandRehearsal = async (
  bandId: string,
  studioId: string,
  rehearsal: ScheduleFormType['rehearsal'],
  repeatWeeks: number,
  createdBy: string,
) => {
  if (!isStartBeforeEnd(rehearsal.start, rehearsal.end)) {
    return {
      success: false,
      errors: { message: 'Start time should be before end time' },
    };
  }

  const rehearsals = createRehearsals(rehearsal, repeatWeeks);

  if (!rehearsals.length) {
    return {
      success: false,
      errors: { message: 'Failed to update band schedule' },
    };
  }

  const updateBand = await BandModel.findOneAndUpdate(
    {
      _id: bandId,
      studioId,
    },
    {
      $push: {
        rehearsals: {
          $each: rehearsals.map((rehearsal) => ({
            ...rehearsal,
            bandId,
            createdBy,
          })),
        },
      },
    },
    { new: true },
  );

  if (!updateBand) {
    return {
      success: false,
      errors: { message: 'Failed to update band schedule' },
    };
  }

  revalidateTag('studio');
  return {
    success: true,
    data: dataMapper(updateBand),
  };
};

const createBandWithRehearsal = async (
  band: BandZodType,
  repeatWeeks: number,
): Promise<Response<BandZodType>> => {
  if (!isStartBeforeEnd(band.rehearsals[0].start, band.rehearsals[0].end)) {
    return {
      success: false,
      errors: { message: 'Start time should be before end time' },
    };
  }

  const rehearsals = createRehearsals(band.rehearsals[0], repeatWeeks);

  // Create the band instance without saving
  const newBand = new BandModel({
    ...band,
    rehearsals: [],
  });

  // Now we can use newBand._id to set the bandId for rehearsals
  newBand.rehearsals = rehearsals.map((rehearsal) => ({
    ...rehearsal,
    // TODO: figure out how to do this without asserting (maybe typeguard or try to fix types)
    bandId: newBand._id as string, // ??? ahh shitty types
    createdBy: band.createdBy,
  }));

  // Save the band with rehearsals in one operation
  await newBand.save();

  if (!newBand) {
    return {
      success: false,
      errors: { message: 'Failed to create band' },
    };
  }

  await StudioModel.findByIdAndUpdate(band.studioId, {
    $push: { bands: newBand._id },
  });

  revalidateTag('studio');
  return {
    success: true,
    data: dataMapper(newBand),
  };
};

export const createOrUpdateBand = async (
  band: Omit<BandZodType, 'createdBy'>,
  repeatWeeks: number,
): Promise<Response<BandZodType>> => {
  await connectMongo();
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not found');
  }

  const validateBandSchema = ZodBandSchema.safeParse({
    ...band,
    createdBy: userId,
  });

  if (!validateBandSchema.success) {
    console.error(validateBandSchema.error.errors);
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }

  try {
    await setRateLimit();

    // TODO: Use find one, this is probably not efficient
    const existingBand = await BandModel.find({
      name: validateBandSchema.data.name,
      studioId: validateBandSchema.data.studioId,
    }).lean();

    if (
      hasTimeslotConflict(existingBand, validateBandSchema.data.rehearsals[0])
    ) {
      return {
        success: false,
        errors: { message: 'Rehearsal slot is already taken' },
      };
    }

    if (existingBand.length > 0) {
      return await createExistingBandRehearsal(
        existingBand[0]._id.toString(),
        validateBandSchema.data.studioId,
        validateBandSchema.data.rehearsals[0],
        repeatWeeks,
        userId,
      );
    }

    return await createBandWithRehearsal(validateBandSchema.data, repeatWeeks);
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

export const deleteSchedule = async (
  bandId: string,
  scheduleId: string,
  studioId: string,
): Promise<Response<never>> => {
  await connectMongo();
  const _ = getAuthedUserId();

  try {
    await setRateLimit();
    const band = await BandModel.findOneAndUpdate(
      { _id: bandId, studioId },
      { $pull: { rehearsals: { _id: scheduleId } } },
      { safe: true, multi: false },
    );

    if (!band) {
      return {
        success: false,
        errors: { message: 'Rehearsal slot not deleted' },
      };
    }

    revalidateTag('studio');
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to delete band schedule' },
    };
  }
};

export const updateTimeslot = async (
  bandId: string,
  scheduleId: string,
  studioId: string,
  rehearsal: ScheduleFormType['rehearsal'],
) => {
  await connectMongo();
  const _ = getAuthedUserId();

  const validateRehearsalSchema = PickedZodCreateScheduleSchema.safeParse({
    rehearsal,
  });

  if (!validateRehearsalSchema.success) {
    return {
      success: false,
      errors: validateRehearsalSchema.error.errors,
    };
  }

  if (
    !isStartBeforeEnd(
      validateRehearsalSchema.data.rehearsal.start,
      validateRehearsalSchema.data.rehearsal.end,
    )
  ) {
    return {
      success: false,
      errors: { message: 'Start time should be before end time' },
    };
  }

  try {
    await setRateLimit();

    const existingBands = await BandModel.find({
      studioId,
    }).lean();

    const hasConflict = hasTimeslotConflict(existingBands, rehearsal);
    if (hasConflict) {
      return {
        success: false,
        errors: { message: 'Rehearsal slot is already taken' },
      };
    }

    const band = await BandModel.findOneAndUpdate(
      {
        _id: bandId,
        studioId,
        rehearsals: { $elemMatch: { _id: scheduleId } },
      },
      {
        $set: {
          'rehearsals.$.title': rehearsal.title,
          'rehearsals.$.start': rehearsal.start,
          'rehearsals.$.end': rehearsal.end,
        },
      },
      {
        new: true,
      },
    );

    if (!band) {
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }
    revalidateTag('studio');

    return {
      success: true,
      data: dataMapper(band),
    };
  } catch (error) {
    return {
      success: false,
      errors: { message: 'Failed to update band schedule' },
    };
  }
};

type DeleteBandResponse = {
  success: boolean;
  errors?: { message: string };
};

export const deleteBand = async (
  bandId: string,
  studioId: string,
): Promise<DeleteBandResponse> => {
  const userId = getAuthedUserId();

  await connectMongo();

  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await setRateLimit();

    const band = await BandModel.findOne({
      _id: bandId,
      studioId,
      $or: [
        { createdBy: userId }, // Band creator
        { studioId: { $in: studioId } }, // User is part of the studio
      ],
    }).session(session);

    if (!band) {
      await session.abortTransaction();
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }

    // Remove the band from the studio's bands array
    await StudioModel.findByIdAndUpdate(
      studioId,
      {
        $pull: { bands: bandId },
      },
      { session },
    );

    // Delete the band
    await BandModel.findByIdAndDelete(bandId).session(session);

    // Commit the transaction
    await session.commitTransaction();

    revalidateTag('bands');
    revalidateTag(`studio`);

    return {
      success: true,
    };
  } catch (error) {
    // If anything fails, abort the transaction
    await session.abortTransaction();
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to delete band' },
    };
  } finally {
    session.endSession();
  }
};
