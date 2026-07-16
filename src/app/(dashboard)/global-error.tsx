"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div className="flex max-w-lg flex-col items-center rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-10 text-center shadow-lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <svg
              className="h-8 w-8 text-red-500"
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
          <h2 className="mb-2 text-xl font-semibold text-[#1A1A1A]">
            Application Error
          </h2>
          <p className="mb-2 text-sm text-[#737373]">
            {error.message || "A critical error has occurred."}
          </p>
          {error.digest && (
            <p className="mb-6 font-mono text-xs text-[#737373]">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="rounded-xl bg-[#10B981] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-6 w-full text-left">
              <summary className="cursor-pointer text-sm font-medium text-[#737373]">
                Error Details
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-[#F0F0F0] p-4 text-xs text-[#1A1A1A]">
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </body>
    </html>
  );
}
