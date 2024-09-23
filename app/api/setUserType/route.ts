import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { role } = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (role !== 'admin') {
      return new Response('Invalid user type', { status: 400 });
    }

    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role,
      },
    });

    return new Response('User type updated', { status: 200 });
  } catch (error) {
    console.error('Error updating user type', error);
    return new Response('Internal server error', { status: 500 });
  }
}
