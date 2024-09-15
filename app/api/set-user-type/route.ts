import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { userType } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (userType !== 'admin' && userType !== 'band') {
      return new Response('Invalid user type', { status: 400 });
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        userType,
      },
    });

    return new Response('User type updated', { status: 200 });
  } catch (error) {
    console.error('Error updating user type', error);
    return new Response('Internal server error', { status: 500 });
  }
}
