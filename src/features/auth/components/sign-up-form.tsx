"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  type AuthActionState,
  signupAction,
} from "@/features/auth/actions/auth-actions";
import { SubmitButton } from "./submit-button";

const initialState: AuthActionState = {
  status: "idle",
};

export function SignUpForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        {state.fieldErrors?.name ? (
          <p id="name-error" className="text-sm text-red-600 dark:text-red-300">
            {state.fieldErrors.name[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className="text-sm text-red-600 dark:text-red-300">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        {state.fieldErrors?.password ? (
          <p id="password-error" className="text-sm text-red-600 dark:text-red-300">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          aria-describedby={
            state.fieldErrors?.confirmPassword
              ? "confirm-password-error"
              : undefined
          }
          className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
        {state.fieldErrors?.confirmPassword ? (
          <p
            id="confirm-password-error"
            className="text-sm text-red-600 dark:text-red-300"
          >
            {state.fieldErrors.confirmPassword[0]}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creating account...">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
