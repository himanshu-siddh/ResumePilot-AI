import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-20">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            ResumePilot AI
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
            >
              Get started
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              AI resume reviewer
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-6xl">
              Improve your resume before recruiters ever see it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Upload your resume, get ATS scoring, grammar feedback, missing
              skills, and practical AI suggestions tailored to your next role.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-200"
              >
                Create free account
              </Link>
              <Link
                href="/signin"
                className="inline-flex h-12 items-center justify-center rounded-md border border-zinc-300 px-6 text-sm font-medium text-zinc-950 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-4">
              {[
                ["ATS Score", "82/100"],
                ["Missing Skills", "TypeScript, PostgreSQL"],
                ["Grammar Issues", "4 improvements"],
                ["AI Suggestions", "12 recommendations"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="mt-1 text-xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
