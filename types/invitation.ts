import { z } from 'zod';

// Zod schema for the Invitation model
export const ZodInvitationSchema = z.object({
  _id: z.any().optional(),
  token: z
    .string({
      invalid_type_error: 'Token must be a string',
      message: 'Token is required',
    })
    .min(1, { message: 'Token cannot be empty' }),
  invitationName: z.string({
    invalid_type_error: 'Invitation name must be a string',
    message: 'Invitation name is required',
  }),
  studioId: z
    .string({
      invalid_type_error: 'Studio ID must be a string',
      message: 'Studio ID is required',
    })
    .min(1, { message: 'Studio ID cannot be empty' }),
  expiresAt: z
    .date({
      invalid_type_error: 'Expiration date must be a valid date',
      message: 'Expiration date is required',
    })
    .refine((date) => date > new Date(), {
      message: 'Expiration date must be in the future',
    }),
});

export type InvitationZodType = z.infer<typeof ZodInvitationSchema>;
