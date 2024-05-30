'use server';
import connectMongo from '@/lib/mongodb';
import Band from '../models/Band';
import { BandZodType, ZodBandSchema } from '@/types/band';
import BandModel from '../models/Band';
import { ZodIssue } from 'zod';

type FetchBandsResponse = {
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
      data: validateSchema.data,
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
