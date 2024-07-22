'use server';

import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import {
  CreateStudioResponse,
  StudioZodType,
  ZodStudioSchema,
} from '@/types/studio';
import { auth } from '@clerk/nextjs/server';
import { revalidateTag } from 'next/cache';

export const createStudio = async (
  studioFormData: Pick<StudioZodType, 'name' | 'location'>,
): Promise<CreateStudioResponse> => {
  await connectMongo();

  const { userId } = auth();
  const studioData = {
    ...studioFormData,
    createdBy: userId,
    bands: [],
  };

  const validateStudioSchema = ZodStudioSchema.safeParse(studioData);

  if (!validateStudioSchema.success) {
    return {
      success: false,
      errors: validateStudioSchema.error.errors,
    };
  }

  try {
    const newStudio = new StudioModel(validateStudioSchema.data);
    await newStudio.save();

    if (!newStudio) {
      return {
        success: false,
        errors: { message: 'Failed to create or update band' },
      };
    }

    revalidateTag('studios');
    return {
      success: true,
      data: validateStudioSchema.data,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        success: false,
        errors: { message: 'Studio name already exists' },
      };
    } else {
      return {
        success: false,
        errors: { message: 'Failed to create or update band' },
      };
    }
  }
};
