"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-red-600 dark:text-red-300">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          We could not load this page.
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          {error.digest
            ? "The error was logged with a diagnostic reference."
            : "Please try again. If the issue continues, contact support."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
