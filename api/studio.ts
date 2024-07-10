'server-only';

import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import { ZodStudioSchema } from '@/types/studio';

export const getStudioById = async (studioId: string) => {
  await connectMongo();
  try {
    const studio = await StudioModel.findById(studioId).lean();

    if (!studio) {
      return {
        success: false,
        errors: { message: 'Studio not found' },
      };
    }
    const validateStudioSchema = ZodStudioSchema.safeParse(studio);

    if (!validateStudioSchema.success) {
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

export const getStudios = async () => {
  await connectMongo();
  try {
    const studios = await StudioModel.find({
      name: { $exists: true },
      location: { $exists: true },
    }).lean();

    return studios;
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};
