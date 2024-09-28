'server-only';

import { Resend } from 'resend';
import InvitationModel from '../models/Invitation';
import connectMongo from '@/lib/mongodb';
import { getAuthedUserId } from '@/api/auth';
import { InvitationEmailTemplate } from '@/components/InvitationEmailTemplate';
import { type Response } from '@/types/band';
import { InvitationZodType, ZodInvitationSchema } from '@/types/invitation';

const resend = new Resend(process.env.RESEND_API_KEY);

type CreateInvitationParams = {
  invitationName: string;
  expiresAt: Date;
  studioId: string;
  email: string;
};

export const createInvitation = async ({
  invitationName,
  expiresAt,
  studioId,
  email,
}: CreateInvitationParams): Promise<Response<InvitationZodType>> => {
  await connectMongo();

  const userId = getAuthedUserId();

  if (!userId) {
    return {
      success: false,
      errors: { message: 'User not found' },
    };
  }

  const token = crypto.randomUUID();
  const expiresAtDefault = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // token expires in 7 days

  const invitationObj = {
    token,
    studioId,
    invitationName,
    expiresAt: expiresAt ? expiresAt : expiresAtDefault,
    email,
  };

  try {
    const parsedData = ZodInvitationSchema.safeParse(invitationObj);

    if (!parsedData.success) {
      return {
        success: false,
        errors: parsedData.error.errors,
      };
    }

    console.log('parsedData', parsedData);
    const newInvitation = new InvitationModel({
      token: parsedData.data.token,
      invitationName: parsedData.data.invitationName,
      studioId: parsedData.data.studioId,
      expiresAt: expiresAt ? parsedData.data.expiresAt : expiresAtDefault,
    });
    const saved = await newInvitation.save();

    if (newInvitation.errors || saved.errors) {
      console.log('newInvitation.errors', newInvitation.errors);
      return {
        success: false,
        errors: { message: 'Failed to create or update band' },
      };
    }

    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/studio/${studioId}/invitation/${token}/sign-up`;

    const { error: emailError } = await resend.emails.send({
      from: 'BandScheduler <no-reply@bandscheduler-mail.xyz>',
      to: email,
      subject: 'Invitation to join BandsScheduler',
      react: InvitationEmailTemplate({
        invitationLink,
      }),
    });

    if (emailError) {
      console.log('emailError', emailError);
      return {
        success: false,
        errors: { message: 'Failed to send email' },
      };
    }

    return {
      success: true,
      data: parsedData.data,
    };
  } catch (error) {
    console.error('Error', error);
    return {
      success: false,
      errors: { message: 'Failed to create invitation' },
    };
  }
};
