import { z } from 'zod';

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
  expiresAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: 'Expiration date must be in the future',
  }),
  email: z.string().email('Invalid email address'),
});

export type InvitationZodType = z.infer<typeof ZodInvitationSchema>;

export const ZodInvitationFormSchema = ZodInvitationSchema.pick({
  invitationName: true,
  expiresAt: true,
  email: true,
});
