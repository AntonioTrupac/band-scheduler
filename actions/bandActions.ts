'use server';
import connectMongo from '@/lib/mongodb';
import {
  Response,
  BandZodType,
  ZodBandSchema,
  ScheduleFormType,
  PickedZodCreateScheduleSchema,
} from '@/types/band';
import BandModel from '../models/Band';
import StudioModel from '@/models/Studio';
import { revalidateTag } from 'next/cache';

export const createBand = async (
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

    const newBand = new BandModel(validateBandSchema.data);
    await newBand.save();

    await StudioModel.findByIdAndUpdate(validateBandSchema.data.studioId, {
      $push: { bands: newBand._id },
    });

    revalidateTag('studio');
    return {
      success: true,
      data: band,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

const hasTimeslotConflict = (
  existingBands: BandZodType[],
  rehearsal: ScheduleFormType['rehearsal'],
): boolean => {
  const dateStart = new Date(rehearsal.start);
  const dateEnd = new Date(rehearsal.end);

  return existingBands.some((band) => {
    return band.rehearsals.some((existingRehearsal) => {
      const existingStart = new Date(existingRehearsal.start);
      const existingEnd = new Date(existingRehearsal.end);

      return (
        (dateStart >= existingStart && dateStart <= existingEnd) ||
        (dateEnd >= existingStart && dateEnd <= existingEnd) ||
        (existingStart >= dateStart && existingStart <= dateEnd) ||
        (existingEnd >= dateStart && existingEnd <= dateEnd)
      );
    });
  });
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
    console.log('EXISTING BANDS', existingBands);
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

    const band = await BandModel.findOneAndUpdate(
      { _id: bandId, studioId },
      {
        $push: {
          rehearsals: [
            {
              start: data.rehearsal.start,
              end: data.rehearsal.end,
              title: data.rehearsal.title,
            },
          ],
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
    console.log('WE IN HERE BITCH 2');
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

  const validateRehearsalSchema =
    PickedZodCreateScheduleSchema.safeParse(rehearsal);

  if (!validateRehearsalSchema.success) {
    return {
      success: false,
      errors: validateRehearsalSchema.error.errors,
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
    console.log(error);
    return {
      success: false,
      errors: { message: 'Failed to updaet band schedule' },
    };
  }
};
