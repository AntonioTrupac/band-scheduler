import 'server-only';

import connectMongo from '@/lib/mongodb';
import BandModel, { BandType } from '@/models/Band';
import { Response, BandZodType, ZodBandSchema } from '@/types/band';

const convertObjectIdToString = (band: BandType) => {
  return {
    ...band,
    studioId: band.studioId.toString(),
  };
};

export const fetchBands = async (
  studioId: string,
): Promise<Response<BandZodType[]>> => {
  await connectMongo();
  try {
    const bands = await BandModel.find({
      name: { $exists: true },
      rehearsals: { $exists: true },
      location: { $exists: true },
      studioId,
    }).lean();

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
          location: band.location,
          rehearsals: band.rehearsals.map((rehearsal) => ({
            _id: rehearsal._id?.toString(),
            start: rehearsal.start,
            end: rehearsal.end,
            title: rehearsal.title,
          })),
          studioId: band.studioId,
          createdBy: band.createdBy,
        };
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to fetch bands' },
    };
  }
};

export const getBandsByDate = async (studioId: string, date: string) => {
  await connectMongo();
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bands = await BandModel.find({
      studioId,
      rehearsals: {
        $elemMatch: {
          start: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
    }).lean();

    const bandsWithFilteredRehearsals = bands.map((band) => {
      const filteredRehearsals = band.rehearsals.filter((rehearsal) => {
        const rehearsalDate = new Date(rehearsal.start);
        return rehearsalDate >= startOfDay && rehearsalDate < endOfDay;
      });

      return {
        ...convertObjectIdToString(band),
        rehearsals: filteredRehearsals,
      };
    });

    const validateSchema = ZodBandSchema.array().safeParse(
      bandsWithFilteredRehearsals,
    );

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
          location: band.location,
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
    return {
      success: false,
      errors: { message: 'Failed to fetch bands by date' },
    };
  }
};
