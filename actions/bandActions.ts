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
import { addMinutes, hasTimeslotConflict, subMinutes } from '@/lib/utils';

// if band exists => update the fields other than the band
// if band does not exist => create a new band with new schedule and add it to the studio

const updateBandRehearsal = async (
  bandId: string,
  studioId: string,
  rehearsal: ScheduleFormType['rehearsal'],
) => {
  const adjustedRehearsal = {
    ...rehearsal,
    start: subMinutes(rehearsal.start, 15),
    end: addMinutes(rehearsal.end, 15),
  };

  const updateBand = await BandModel.findOneAndUpdate(
    {
      _id: bandId,
      studioId,
    },

    {
      $push: {
        rehearsals: [adjustedRehearsal],
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

const createBand = async (
  band: BandZodType,
): Promise<Response<BandZodType>> => {
  const adjustedRehearsal = {
    ...band.rehearsals[0],
    start: subMinutes(band.rehearsals[0].start, 15),
    end: addMinutes(band.rehearsals[0].end, 15),
  };

  const newBandData = {
    ...band,
    rehearsals: [adjustedRehearsal],
  };

  const newBand = new BandModel(newBandData);
  await newBand.save();

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
): Promise<Response<BandZodType>> => {
  await connectMongo();
  const validateBandSchema = ZodBandSchema.safeParse(band);

  if (!validateBandSchema.success) {
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }
  try {
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
      );
    } else {
      return await createBand(validateBandSchema.data);
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

  const validateBandSchema = PickedZodCreateScheduleSchema.safeParse(data);
  if (!validateBandSchema.success) {
    return {
      success: false,
      errors: validateBandSchema.error.errors,
    };
  }

  try {
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

    console.log('adjustedRehearsal', adjustedRehearsal);

    const band = await BandModel.findOneAndUpdate(
      { _id: bandId, studioId },
      {
        $push: {
          rehearsals: [adjustedRehearsal],
        },
      },
      { new: true },
    );

    console.log('band', band);

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
  try {
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

// export const
export const updateTimeslot = async (
  bandId: string,
  scheduleId: string,
  studioId: string,
  rehearsal: ScheduleFormType['rehearsal'],
) => {
  await connectMongo();
  const validateRehearsalSchema = PickedZodCreateScheduleSchema.safeParse({
    rehearsal,
  });

  if (!validateRehearsalSchema.success) {
    return {
      success: false,
      // TODO: Check how to make this message make more sense
      errors: { message: 'Something went wrong!' },
    };
  }

  try {
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
      errors: { message: 'Failed to updaet band schedule' },
    };
  }
};
