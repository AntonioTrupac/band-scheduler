import { validateInvitation } from '@/lib/validateInvitation';
import InvitationModel from '@/models/Invitation';
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { role, token } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (role !== 'admin' && role !== 'band') {
      return new Response('Invalid user type', { status: 400 });
    }

    if (role === 'admin') {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role,
          permissions: ['read', 'write', 'manage'],
        },
      });

      return new Response('User type updated', { status: 200 });
    }

    if (role === 'band') {
      if (!token || typeof token !== 'string') {
        return new Response('Invalid token or missing token', { status: 400 });
      }

      const validation = await validateInvitation({ token });

      if (!validation.isValid) {
        return new Response(validation.message, {
          status: validation.message === 'Invitation not found' ? 404 : 400,
        });
      }

      const invitation = await InvitationModel.findOne({ token });

      if (!invitation) {
        return new Response('Invitation not found', { status: 404 });
      }

      invitation.isUsed = true;
      await invitation.save();

      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          role,
          studioId: validation.studioId,
          token,
          permissions: ['read', 'write'],
        },
      });

      return new Response('User type updated', { status: 200 });
    }

    // fallback, should never reach this
    return new Response('Invalid request', { status: 400 });
  } catch (error) {
    console.error('Error updating user type', error);
    return new Response('Internal server error', { status: 500 });
  }
}
