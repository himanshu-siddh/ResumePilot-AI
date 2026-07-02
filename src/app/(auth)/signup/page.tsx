import type { Metadata } from "next";

import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignUpPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start with secure access to your private resume workspace.
        </p>
      </div>
      <SignUpForm />
    </>
  );
}
