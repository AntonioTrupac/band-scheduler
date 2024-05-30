'use server';
import connectMongo from '@/lib/mongodb';
import { BandZodType, ZodBandSchema } from '@/types/band';
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
    });

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
          rehearsals: band.rehearsals,
        };
      }),
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

type CreateBandResponse = {
  success: boolean;
  data?: BandZodType;
  errors?: ZodIssue[];
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
    console.log('VALIDATE', validateBandSchema.data);
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

type UpdateBandResponse = {
  success: boolean;
  data?: BandZodType;
  errors?: ZodIssue[] | { message: string };
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

    const _id = Object(band._id);

    const updatedBand = await BandModel.findByIdAndUpdate(_id, band, {
      new: true,
    });

    if (!updatedBand) {
      return {
        success: false,
        errors: { message: 'Band not found' },
      };
    }

    return {
      success: true,
      data: updatedBand,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};
