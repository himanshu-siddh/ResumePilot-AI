import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
