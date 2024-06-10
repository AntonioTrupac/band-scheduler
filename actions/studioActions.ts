import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import {
  CreateStudioResponse,
  StudioZodType,
  ZodStudioSchema,
} from '@/types/studio';

export const createStudio = async (
  studio: StudioZodType,
): Promise<CreateStudioResponse> => {
  await connectMongo();

  try {
    const validateStudioSchema = ZodStudioSchema.safeParse(studio);

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
