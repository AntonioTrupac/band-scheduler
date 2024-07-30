'server-only';

import { auth } from '@clerk/nextjs/server';

export const getAuthedUserId = () => {
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  return userId;
};
