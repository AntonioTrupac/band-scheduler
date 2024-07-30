'server-only';

import { headers } from 'next/headers';
import { getIP } from './headers';
import { ratelimit } from '@/lib/upstash';

export const setRateLimit = async () => {
  const ip = getIP();

  const { success: limitReached } = await ratelimit.limit(ip);

  if (limitReached) {
    return {
      success: false,
      errors: { message: 'Rate limit exceeded' },
    };
  }
};
