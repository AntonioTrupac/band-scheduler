'server-only';

import * as Sentry from '@sentry/nextjs';

export const SentryServerActionWrapper = async <T extends unknown>(
  action: () => Promise<T>,
  actionName: string,
) => {
  return await Sentry.withServerActionInstrumentation(
    actionName,
    {},
    async () => {
      return await action();
    },
  );
};
