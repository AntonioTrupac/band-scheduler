import connectMongo from '@/lib/mongodb';
import InvitationModel from '@/models/Invitation';

interface ValidateInvitationParams {
  token: string;
  studioId?: string;
}

interface ValidateInvitationResult {
  isValid: boolean;
  message: string;
  studioId?: string;
}

export async function validateInvitation({
  token,
}: ValidateInvitationParams): Promise<ValidateInvitationResult> {
  if (!token || typeof token !== 'string') {
    return { isValid: false, message: 'Invalid or missing token' };
  }

  await connectMongo();

  const invitation = await InvitationModel.findOne({ token });

  if (!invitation) {
    return { isValid: false, message: 'Invitation not found' };
  }

  if (invitation.isUsed) {
    return { isValid: false, message: 'Invitation has already been used' };
  }

  if (invitation.expiresAt < new Date()) {
    return { isValid: false, message: 'Invitation link has expired' };
  }

  return {
    isValid: true,
    message: 'Invitation is valid',
    studioId: invitation.studioId.toString(),
  };
}
