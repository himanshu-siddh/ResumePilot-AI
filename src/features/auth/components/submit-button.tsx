"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
};

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
