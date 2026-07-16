"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <ErrorBoundary
        fallback={
          <div className="flex max-w-lg flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--destructive)]/10">
              <svg
                className="h-8 w-8 text-[var(--destructive)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--foreground)]">
              Dashboard Error
            </h2>
            <p className="mb-2 text-sm text-[var(--muted-foreground)]">
              {error.message || "An unexpected error occurred in the dashboard."}
            </p>
            {error.digest && (
              <p className="mb-6 font-mono text-xs text-[var(--muted-foreground)]">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 w-full text-left">
                <summary className="cursor-pointer text-sm font-medium text-[var(--muted-foreground)]">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-[var(--muted)] p-4 text-xs text-[var(--foreground)]">
                  {error.message}
                  {"\n\n"}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        }
      >
        <div />
      </ErrorBoundary>
    </div>
  );
}
