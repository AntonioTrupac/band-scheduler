import { Resend } from 'resend';
import InvitationModel from '../models/Invitation';
import connectMongo from '@/lib/mongodb';
import { getAuthedUserId } from '@/api/auth';
import { InvitationEmailTemplate } from '@/components/InvitationEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export const createInvitation = async (studioId: string, email: string) => {
  await connectMongo();

  const userId = getAuthedUserId();

  if (!userId) {
    return {
      success: false,
      errors: { message: 'User not found' },
    };
  }

  if (!userId) {
    throw new Error('User not found');
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // token expires in 7 days

  try {
    const newInvitation = new InvitationModel({
      token,
      studioId,
      expiresAt,
    });
    const saved = await newInvitation.save();

    if (newInvitation.errors || saved.errors) {
      return {
        success: false,
        errors: { message: 'Failed to create or update band' },
      };
    }

    const invitationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/studio/${studioId}/invitation/${token}/sign-up`;

    const { data, error: emailError } = await resend.emails.send({
      from: 'BandScheduler no-reply@bandscheduler-mail.xyz',
      to: email,
      subject: 'Invitation to join BandsScheduler',
      react: InvitationEmailTemplate({
        invitationLink,
      }),
    });

    if (emailError) {
      return {
        success: false,
        errors: { message: 'Failed to send email' },
      };
    }

    if (data) {
      return {
        success: true,
        data: data.id,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: { message: 'Failed to create invitation' },
    };
  }
};
