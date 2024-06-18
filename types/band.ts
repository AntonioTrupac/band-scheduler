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
  location: z
    .string({
      invalid_type_error: 'Location must be a string',
      message: 'Location is required',
    })
    .min(1, { message: 'Location field must be atleast 1 character long' })
    .max(255, { message: 'Location field value too long' }),
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
  studioId: z.string({
    invalid_type_error: 'Studio must be a string',
    message: 'Studio is required',
  }),
});

export type BandZodType = z.infer<typeof ZodBandSchema>;

export type Response<T> = {
  success: boolean;
  data?: T;
  errors?: ZodIssue[] | { message: string };
};

export const ZodCreateBandSchema = z.object({
  name: z
    .string({
      invalid_type_error: 'Name must be a string',
      message: 'Name is required',
    })
    .min(1, { message: 'Name too short' })
    .max(255, { message: 'Name too long' }),
  location: z
    .string({
      invalid_type_error: 'Location must be a string',
      message: 'Location is required',
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

export type BandFormType = z.infer<typeof ZodCreateBandSchema>;

export const PickedZodCreateBandSchema = ZodCreateBandSchema.pick({
  name: true,
  location: true,
});

export type CreateBandFormType = z.infer<typeof PickedZodCreateBandSchema>;

export const PickedZodCreateScheduleSchema = ZodCreateBandSchema.pick({
  rehearsal: true,
});

export type CreateScheduleFormType = z.infer<
  typeof PickedZodCreateScheduleSchema
>;
