import { z, ZodIssue } from 'zod';

export type CreateStudioResponse = {
  success: boolean;
  data?: StudioZodType;
  errors?: ZodIssue[] | { message: string };
};

export const ZodStudioSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1)
    .max(255),
  location: z
    .string({
      invalid_type_error: 'Location must be a string',
      message: 'Location is required',
    })
    .min(1)
    .max(255),
  createdBy: z
    .string({
      invalid_type_error: 'Created by must be a string',
      message: 'Created by is required',
    })
    .min(1)
    .max(255),
  bands: z.array(z.string().optional()),
});
export type StudioZodType = z.infer<typeof ZodStudioSchema>;
