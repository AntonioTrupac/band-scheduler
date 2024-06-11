'use server';

import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import {
  CreateStudioResponse,
  StudioZodType,
  ZodStudioSchema,
} from '@/types/studio';
import { auth } from '@clerk/nextjs/server';

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

  try {
    const validateStudioSchema = ZodStudioSchema.safeParse(studioData);

    if (!validateStudioSchema.success) {
      return {
        success: false,
        errors: validateStudioSchema.error.errors,
      };
    }

    const newStudio = new StudioModel(validateStudioSchema.data);
    await newStudio.save();

    return {
      success: true,
      data: validateStudioSchema.data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to create or update band' },
    };
  }
};
