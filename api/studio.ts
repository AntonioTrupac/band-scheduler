'server-only';

import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import { ZodStudioSchema } from '@/types/studio';

import { cache } from 'react';
import { getAuthedUserId } from './auth';

export const getStudioById = cache(async (studioId: string) => {
  await connectMongo();

  try {
    const studio = await StudioModel.findById(studioId).lean();

    if (!studio) {
      return { success: false, errors: { message: 'Studio not found' } };
    }

    const validateStudioSchema = ZodStudioSchema.safeParse(studio);

    if (!validateStudioSchema.success) {
      return {
        success: false,
        errors: {
          message: 'Invalid studio data',
          details: validateStudioSchema.error.errors,
        },
      };
    }

    return {
      success: true,
      data: {
        _id: studio._id.toString(),
        name: validateStudioSchema.data.name,
        location: validateStudioSchema.data.location,
      },
    };
  } catch (error) {
    console.error('Error in getStudioById:', error);
    return {
      success: false,
      errors: { message: 'An unexpected error occurred' },
    };
  }
});

export const getStudios = async (userId: string) => {
  await connectMongo();

  try {
    const studios = await StudioModel.find({
      name: { $exists: true },
      location: { $exists: true },
      createdBy: { $eq: userId },
    }).lean();

    if (studios.length < 1) {
      return {
        success: false,
        errors: { message: 'No studios found' },
      };
    }

    return {
      success: true,
      data: studios.map((studio) => {
        return {
          _id: studio._id.toString(),
          name: studio.name,
          location: studio.location,
        };
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to fetch studios' },
    };
  }
};
