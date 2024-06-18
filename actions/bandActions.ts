'use server';
import connectMongo from '@/lib/mongodb';
import {
  Response,
  BandZodType,
  ZodBandSchema,
  CreateScheduleFormType,
  PickedZodCreateScheduleSchema,
} from '@/types/band';
import BandModel from '../models/Band';
import StudioModel from '@/models/Studio';
import { revalidateTag } from 'next/cache';

// TODO: Instead of this unnecessary function, make name field unique
const ifBandExists = async (name: string, studioId: string) => {
  const band = await BandModel.find({
    name,
    studioId,
  }).lean();

  return band.length > 0;
};

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
    const bandExists = await ifBandExists(
      validateBandSchema.data.name,
      validateBandSchema.data.studioId,
    );

    if (bandExists) {
      return {
        success: false,
        errors: [
          {
            path: ['name'],
            message: 'Band name already exists',
            code: 'custom',
          },
        ],
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

// const hasTimeslotConflict = (
//   existingBands: BandZodType[],
//   rehearsal: CreateScheduleFormType['rehearsal'],
// ) => {
//   const dateStart = new Date(rehearsal.start);
//   const dateEnd = new Date(rehearsal.end);

//   return existingBands.map((band) => {
//     return band.rehearsals.some((existingRehearsal) => {
//       const existingStart = new Date(existingRehearsal.start);
//       const existingEnd = new Date(existingRehearsal.end);

//       return (
//         (dateStart >= existingStart && dateStart <= existingEnd) ||
//         (dateEnd >= existingStart && dateEnd <= existingEnd)
//       );
//     });
//   });
// };

export const createBandSchedule = async (
  data: CreateScheduleFormType,
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
    // if (!existingBands) {
    //   return {
    //     success: false,
    //     errors: { message: 'Band not found' },
    //   };
    // }

    // const hasConflict = hasTimeslotConflict(existingBands, data.rehearsal);

    // if (hasConflict) {
    //   return {
    //     success: false,
    //     errors: { message: 'Rehearsal slot is already taken' },
    //   };
    // }

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

    console.log('BAND', band);

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

// export const createOrUpdateBand = async (
//   band: BandZodType,
// ): Promise<CreateOrUpdateResponse> => {
//   await connectMongo();
//   try {
//     const validateBandSchema = ZodBandSchema.safeParse(band);

//     if (!validateBandSchema.success) {
//       return {
//         success: false,
//         errors: validateBandSchema.error.errors,
//       };
//     }

//     const existingBand = await BandModel.findById(band._id).lean();

//     if (existingBand) {
//       // timeslot logic
//       const conflict = hasRehearsalConflict(existingBand, band.rehearsals[0]);

// if (conflict) {
//   return {
//     success: false,
//     errors: { message: 'Rehearsal slot is already taken' },
//   };
// }

//       const upsertResponse = await BandModel.findOneAndUpdate(
//         band._id,
//         validateBandSchema.data,
//         {
//           upsert: true,
//           new: true,
//         },
//       );

//       return {
//         success: true,
//         data: {
//           ...upsertResponse,
//           _id: upsertResponse._id?.toString(),
//           rehearsals: upsertResponse.rehearsals.map((rehearsal) => ({
//             ...rehearsal,
//             _id: rehearsal._id?.toString(),
//           })),
//         },
//       };
//     }

//     return {
//       success: false,
//       errors: { message: 'Band not found' },
//     };
//   } catch (error) {
//     console.error(error);
//     return {
//       success: false,
//       errors: { message: 'Failed to create or update band' },
//     };
//   }
// };
