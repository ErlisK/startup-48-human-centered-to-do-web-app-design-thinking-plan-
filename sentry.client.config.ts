import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only initialise when DSN is provided (allows dev without Sentry account)
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV,
    // Performance: 5% of transactions in production to stay on free tier
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,
    // Session replays: opt-in only, never on free-tier users by default
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // Reduce PII leakage
    beforeSend(event) {
      // Strip email from user context to comply with GDPR/privacy policy
      if (event.user?.email) {
        event.user = { ...event.user, email: undefined };
      }
      return event;
    },
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}
