import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen bg-zinc-50 px-6 py-10 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-8 text-center text-lg font-semibold tracking-tight"
        >
          ResumePilot AI
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
