"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard unavailable
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          We could not load your protected workspace. Please try again.
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
