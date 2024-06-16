import 'server-only';
import connectMongo from '@/lib/mongodb';
import BandModel, { BandType } from '@/models/Band';
import { FetchBandsResponse, ZodBandSchema } from '@/types/band';
import mongoose from 'mongoose';

const convertObjectIdToString = (band: BandType) => {
  return {
    ...band,
    studioId: band.studioId.toString(),
  };
};

export const fetchBands = async (
  studioId: string,
): Promise<FetchBandsResponse> => {
  await connectMongo();
  try {
    const bands = await BandModel.find({
      name: { $exists: true },
      rehearsals: { $exists: true },
      studioId,
    }).lean();
    console.log(bands);

    const bandsWithStudioId = bands.map((band) => {
      return convertObjectIdToString(band);
    });

    const validateSchema = ZodBandSchema.array().safeParse(bandsWithStudioId);

    if (!validateSchema.success) {
      console.error(validateSchema.error.errors);
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
          studioId: band.studioId,
        };
      }),
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};
