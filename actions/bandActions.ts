'use server';
import connectMongo from '@/lib/mongodb';
import {
  BandFormType,
  BandZodType,
  CreateBandResponse,
  CreateOrUpdateResponse,
  UpdateBandResponse,
  ZodBandSchema,
} from '@/types/band';
import BandModel from '../models/Band';
import { ZodIssue } from 'zod';

export type FetchBandsResponse = {
  success: boolean;
  data?: BandZodType[];
  errors?: ZodIssue[];
};

export const fetchBands = async (): Promise<FetchBandsResponse> => {
  await connectMongo();
  try {
    const bands = await BandModel.find({
      name: { $exists: true },
      rehearsals: { $exists: true },
    }).lean();

    const validateSchema = ZodBandSchema.array().safeParse(bands);

    if (!validateSchema.success) {
      return {
        success: false,
        errors: validateSchema.error.errors,
      };
    }

    return {
      success: true,
      data: validateSchema.data.map((band) => {
        return {
          _id: band._id.toString(),
          name: band.name,
          rehearsals: band.rehearsals.map((rehearsal) => ({
            _id: rehearsal._id?.toString(),
            start: rehearsal.start,
            end: rehearsal.end,
            title: rehearsal.title,
          })),
        };
      }),
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

export const createBand = async (
  band: BandZodType,
): Promise<CreateBandResponse> => {
  await connectMongo();
  try {
    const validateBandSchema = ZodBandSchema.safeParse(band);

    if (!validateBandSchema.success) {
      return {
        success: false,
        errors: validateBandSchema.error.errors,
      };
    }

    const newBand = new BandModel(validateBandSchema.data);
    await newBand.save();

    return {
      success: true,
      data: band,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

export const updateBand = async (
  band: BandZodType,
): Promise<UpdateBandResponse> => {
  await connectMongo();
  try {
    const validateBandSchema = ZodBandSchema.safeParse(band);

    if (!validateBandSchema.success) {
      return {
        success: false,
        errors: validateBandSchema.error.errors,
      };
    }

    const { _id, ...updateData } = band;
    if (!_id) {
      return {
        success: false,
        errors: { message: 'Band ID is required for update' },
      };
    }

    const updatedBand = await BandModel.findByIdAndUpdate(_id, updateData, {
      new: true,
    }).lean();

    console.log('updated band', updatedBand);

    if (!updatedBand) {
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }

    return {
      success: true,
      data: {
        ...updatedBand,
        _id: updatedBand._id.toString(),
        rehearsals: updatedBand.rehearsals.map((rehearsal) => ({
          ...rehearsal,
          _id: rehearsal._id?.toString(),
        })),
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

const hasRehearsalConflict = (
  existingBand: BandZodType,
  rehearsal: BandFormType['rehearsal'],
) => {
  const dateStart = new Date(rehearsal.start);
  const dateEnd = new Date(rehearsal.end);

  return existingBand.rehearsals.some((r) => {
    const rehearsalStart = new Date(r.start);
    const rehearsalEnd = new Date(r.end);

    return (
      (dateStart >= rehearsalStart && dateStart <= rehearsalEnd) ||
      (dateEnd >= rehearsalStart && dateEnd <= rehearsalEnd)
    );
  });
};

export const createOrUpdateBand = async (
  band: BandZodType,
): Promise<CreateOrUpdateResponse> => {
  await connectMongo();
  try {
    const validateBandSchema = ZodBandSchema.safeParse(band);

    if (!validateBandSchema.success) {
      return {
        success: false,
        errors: validateBandSchema.error.errors,
      };
    }

    const existingBand = await BandModel.findById(band._id).lean();

    if (existingBand) {
      // timeslot logic
      const conflict = hasRehearsalConflict(existingBand, band.rehearsals[0]);

      if (conflict) {
        return {
          success: false,
          errors: { message: 'Rehearsal slot is already taken' },
        };
      }

      const upsertResponse = await BandModel.findOneAndUpdate(
        band._id,
        validateBandSchema.data,
        {
          upsert: true,
          new: true,
        },
      );

      return {
        success: true,
        data: {
          ...upsertResponse,
          _id: upsertResponse._id?.toString(),
          rehearsals: upsertResponse.rehearsals.map((rehearsal) => ({
            ...rehearsal,
            _id: rehearsal._id?.toString(),
          })),
        },
      };
    }

    return {
      success: false,
      errors: { message: 'Band not found' },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to create or update band' },
    };
  }
};
