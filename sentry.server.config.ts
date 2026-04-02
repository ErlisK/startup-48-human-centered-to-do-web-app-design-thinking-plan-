import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
    // Strip PII from user context
    beforeSend(event) {
      if (event.user?.email) {
        event.user = { ...event.user, email: undefined };
      }
      return event;
    },
  });
}
