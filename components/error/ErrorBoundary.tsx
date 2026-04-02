"use client";
import React from "react";
import * as Sentry from "@sentry/nextjs";

interface Props { children: React.ReactNode; fallback?: React.ReactNode; }
interface State { hasError: boolean; eventId: string | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    this.setState({ eventId: eventId ?? null });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div role="alert" style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>⚠️</p>
        <h2 style={{ fontSize: 18, color: "var(--text-primary)", marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, marginBottom: 16 }}>
          This error has been reported. Please{" "}
          <a href="javascript:location.reload()" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>
            reload the page
          </a>{" "}
          to continue.
        </p>
        {this.state.eventId && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
            Event ID: {this.state.eventId}
          </p>
        )}
        <button
          onClick={() => this.setState({ hasError: false, eventId: null })}
          style={{ marginTop: 8, padding: "8px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13 }}>
          Try again
        </button>
      </div>
    );
  }
}

/** Convenience wrapper for async data components */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name})`;
  return Wrapped;
}
