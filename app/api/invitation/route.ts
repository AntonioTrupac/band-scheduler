import { createInvitation } from '@/api/invitation';
import { getAuthedUserId } from '@/api/auth';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const userId = getAuthedUserId();

  if (!userId) {
    return new Response(
      JSON.stringify({
        errors: {
          message: 'Unauthorized',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const userIsAdmin = await clerkClient.users
    .getUser(userId)
    .then((user) => user?.publicMetadata?.userType === 'admin');

  if (!userIsAdmin) {
    return new Response(
      JSON.stringify({
        errors: {
          message: 'Access denied. Only admin can create an invitation',
        },
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { invitationName, studioId, expiresAt, email } = await request.json();

    const result = await createInvitation({
      invitationName,
      expiresAt,
      studioId,
      email,
    });

    if (result?.success) {
      return new Response(
        JSON.stringify({
          success: true,
          data: result?.data,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, errors: result?.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (error) {
    console.error('Error processing invitation creation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        errors: { message: 'An unexpected error occurred.' },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
