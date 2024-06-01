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
      _id: z.any().optional(),
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

export type CreateOrUpdateResponse = {
  success: boolean;
  data?: BandZodType;
  errors?: ZodIssue[] | { message: string };
};

export type UpdateBandResponse = {
  success: boolean;
  data?: BandZodType;
  errors?: ZodIssue[] | { message: string };
};

export const ZodFormSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1)
    .max(255),
  rehearsal: z
    .object({
      start: z
        .date({
          invalid_type_error: 'Start must be a date',
          message: 'Start is required',
        })
        .refine((date) => date >= new Date(), {
          message: 'Start date must be in the future',
        }),
      end: z.date({
        invalid_type_error: 'End must be a date',
        message: 'End is required',
      }),
      title: z
        .string({
          invalid_type_error: 'Title must be a string',
          message: 'Title is required',
        })
        .min(1),
    })
    .superRefine(({ start, end }, ctx) => {
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date must be after start date',
          path: ['end'],
        });
      }
    }),
});

export type BandFormType = z.infer<typeof ZodFormSchema>;
