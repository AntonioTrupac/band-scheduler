'server-only';

import StudioModel from '@/models/Studio';
import { ZodStudioSchema } from '@/types/studio';

export const getStudioById = async (studioId: string) => {
  try {
    const studio = await StudioModel.findById(studioId).lean();

    if (!studio) {
      return {
        success: false,
        errors: { message: 'Studio not found' },
      };
    }
    console.log(studio);
    const validateStudioSchema = ZodStudioSchema.safeParse(studio);

    if (!validateStudioSchema.success) {
      console.log(validateStudioSchema.error.errors);
      return {
        success: false,
        // TODO: Return the actual error message
        errors: { message: 'Invalid studio data' },
      };
    }

    return {
      success: true,
      data: {
        name: studio.name,
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};
