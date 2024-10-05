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
import {
  addMinutes,
  addWeeks,
  hasTimeslotConflict,
  isStartBeforeEnd,
  subMinutes,
} from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { getAuthedUserId } from '@/api/auth';
import { setRateLimit } from '@/api/upstash';

const createRehearsals = (
  rehearsal: ScheduleFormType['rehearsal'],
  weeks: number,
) => {
  const rehearsals = [];

  // this means that 'do not repeat' is selected
  if (weeks === 0) {
    rehearsals.push({
      ...rehearsal,
      start: subMinutes(rehearsal.start, 15),
      end: addMinutes(rehearsal.end, 15),
    });
  } else {
    for (let i = 0; i < weeks; i++) {
      const start = addWeeks(rehearsal.start, i);
      const end = addWeeks(rehearsal.end, i);

      rehearsals.push({
        ...rehearsal,
        start: subMinutes(start, 15),
        end: addMinutes(end, 15),
      });
    }
  }

  return rehearsals;
};

const updateBandRehearsal = async (
  bandId: string,
  studioId: string,
  rehearsal: ScheduleFormType['rehearsal'],
  repeatWeeks: number,
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
        rehearsals: { $each: rehearsals },
      },
    },
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
    // TODO: write a transform function to return the data in the correct format
    data: {
      _id: updateBand._id?.toString(),
      name: updateBand.name,
      location: updateBand.location,
      rehearsals: updateBand.rehearsals.map((rehearsal) => ({
        _id: rehearsal._id?.toString(),
        start: rehearsal.start,
        end: rehearsal.end,
        title: rehearsal.title,
      })),
      studioId: updateBand.studioId.toString(),
    },
  };
};

export const createBand = async (
  band: BandZodType,
): Promise<Response<BandZodType>> => {
  await connectMongo();
  const userId = getAuthedUserId();

  const validateBandSchema = ZodBandSchema.safeParse(band);

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

    console.log('newBand', newBand);
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
      data: {
        _id: newBand._id?.toString(),
        name: newBand.name,
        location: newBand.location,
        rehearsals: newBand.rehearsals,
        studioId: newBand.studioId.toString(),
      },
    };
  } catch (error) {
    console.error(error);
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

const createBandFromModal = async (
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

  const newBandData = {
    ...band,
    rehearsals,
  };

  const newBand = new BandModel(newBandData);
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
    data: newBandData,
  };
};

export const createOrUpdateBand = async (
  band: BandZodType,
  repeatWeeks: number,
): Promise<Response<BandZodType>> => {
  await connectMongo();
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not found');
  }

  const validateBandSchema = ZodBandSchema.safeParse(band);

  if (!validateBandSchema.success) {
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }

  try {
    await setRateLimit();

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
      return await updateBandRehearsal(
        existingBand[0]._id.toString(),
        validateBandSchema.data.studioId,
        validateBandSchema.data.rehearsals[0],
        repeatWeeks,
      );
    } else {
      return await createBandFromModal(validateBandSchema.data, repeatWeeks);
    }
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

export const createBandSchedule = async (
  data: ScheduleFormType,
  studioId: string,
  bandId: string,
) => {
  await connectMongo();
  const _ = getAuthedUserId();

  const validateBandSchema = PickedZodCreateScheduleSchema.safeParse(data);
  if (!validateBandSchema.success) {
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }

  if (
    !isStartBeforeEnd(
      validateBandSchema.data.rehearsal.start,
      validateBandSchema.data.rehearsal.end,
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

    if (!existingBands) {
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }

    const hasConflict = hasTimeslotConflict(existingBands, data.rehearsal);

    if (hasConflict) {
      return {
        success: false,
        errors: { message: 'Rehearsal slot is already taken' },
      };
    }

    const adjustedRehearsal = {
      ...data.rehearsal,
      start: subMinutes(new Date(data.rehearsal.start), 15),
      end: addMinutes(new Date(data.rehearsal.end), 15),
    };

    const band = await BandModel.findOneAndUpdate(
      { _id: bandId, studioId },
      {
        $push: {
          rehearsals: [adjustedRehearsal],
        },
      },
      { new: true },
    );

    if (!band) {
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }

    return {
      success: true,
      data: {
        _id: band._id?.toString(),
        name: band.name,
        location: band.location,
        rehearsals: band.rehearsals.map((rehearsal) => ({
          _id: rehearsal._id?.toString(),
          start: rehearsal.start,
          end: rehearsal.end,
          title: rehearsal.title,
        })),
        studioId: band.studioId.toString(),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to create band schedule' },
    };
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
      data: {
        _id: band._id?.toString(),
        name: band.name,
        location: band.location,
        rehearsals: band.rehearsals.map((rehearsal) => ({
          _id: rehearsal._id?.toString(),
          start: rehearsal.start,
          end: rehearsal.end,
          title: rehearsal.title,
        })),
        studioId: band.studioId.toString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: { message: 'Failed to update band schedule' },
    };
  }
};
