import type { Metadata } from "next";

import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to review and improve your resumes.
        </p>
      </div>
      <SignInForm />
    </>
  );
}
