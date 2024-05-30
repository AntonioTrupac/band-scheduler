import { z, ZodIssue } from 'zod';

export const ZodBandSchema = z.object({
  _id: z.any().optional(),
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1)
    .max(255),
  rehearsals: z.array(
    z.object({
      start: z.date({
        invalid_type_error: 'Start must be a date',
        message: 'Start is required',
      }),
      end: z.date({
        invalid_type_error: 'End must be a date',
        message: 'End is required',
      }),
      title: z.string({
        invalid_type_error: 'Title must be a string',
        message: 'Title is required',
      }),
    }),
  ),
});

export type BandZodType = z.infer<typeof ZodBandSchema>;

export type CreateBandResponse = {
  success: boolean;
  data?: BandZodType;
  errors?: ZodIssue[];
};
