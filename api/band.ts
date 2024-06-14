import 'server-only';
import connectMongo from '@/lib/mongodb';
import BandModel from '@/models/Band';
import { FetchBandsResponse, ZodBandSchema } from '@/types/band';
import mongoose from 'mongoose';

export const fetchBands = async (
  studioId: string,
): Promise<FetchBandsResponse> => {
  await connectMongo();
  try {
    // const shittyFuck = new mongoose.Types.ObjectId(studioId).toJSON();
    // console.log('Shitty fuck', shittyFuck);

    // async function getParentFromChild(childId, parentName)
    // { const child = await Child.findById(childId).populate({ path: 'parent', match: { name: parentName } }); console.log(child); }
    const bands = await BandModel.find({
      name: { $exists: true },
      rehearsals: { $exists: true },
      studio: studioId,
    }).lean();

    console.log(bands);
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
          studioId: band.studioId,
        };
      }),
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};
