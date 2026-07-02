"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createResumeAction,
  deleteResumeAction,
  renameResumeAction,
} from "@/features/resumes/actions/resume-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createInitialActionState } from "@/types/action-result";

type ResumeActionFormProps = {
  resumeId: string;
  title: string;
};

function SubmitButton({
  children,
  pendingLabel,
  variant = "default",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function CreateResumeDraftForm() {
  const [state, formAction] = useActionState(
    createResumeAction,
    createInitialActionState<
      { resumeId: string; title: string },
      "title"
    >(),
  );
  const titleErrors = !state.ok ? state.fieldErrors?.title : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create resume draft</CardTitle>
        <CardDescription>
          Create a named resume record now, or use upload to create one from a
          PDF automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="draft-title" className="sr-only">
              Resume title
            </label>
            <input
              id="draft-title"
              name="title"
              type="text"
              placeholder="e.g. Senior Frontend Engineer Resume"
              aria-describedby={
                titleErrors ? "draft-title-error" : undefined
              }
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950"
            />
            {titleErrors ? (
              <p id="draft-title-error" className="mt-2 text-sm text-red-600">
                {titleErrors[0]}
              </p>
            ) : null}
          </div>
          <SubmitButton pendingLabel="Creating...">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create
          </SubmitButton>
        </form>
        {state.message ? (
          <p
            className={`mt-3 text-sm ${
              state.ok ? "text-emerald-600" : "text-red-600"
            }`}
            role={state.ok ? "status" : "alert"}
          >
            {state.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ResumeRenameForm({ resumeId, title }: ResumeActionFormProps) {
  const [state, formAction] = useActionState(
    renameResumeAction,
    createInitialActionState<
      { resumeId: string; title: string },
      "resumeId" | "title"
    >(),
  );
  const titleErrors = !state.ok ? state.fieldErrors?.title : undefined;

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="resumeId" value={resumeId} />
      <label htmlFor={`rename-${resumeId}`} className="sr-only">
        Rename resume
      </label>
      <div className="flex gap-2">
        <input
          id={`rename-${resumeId}`}
          name="title"
          type="text"
          defaultValue={title}
          aria-describedby={
            titleErrors ? `rename-${resumeId}-error` : undefined
          }
          className="h-9 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <SubmitButton pendingLabel="Saving..." variant="outline">
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Rename
        </SubmitButton>
      </div>
      {titleErrors ? (
        <p id={`rename-${resumeId}-error`} className="text-sm text-red-600">
          {titleErrors[0]}
        </p>
      ) : null}
      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ResumeDeleteForm({ resumeId, title }: ResumeActionFormProps) {
  const [state, formAction] = useActionState(
    deleteResumeAction,
    createInitialActionState<
      { resumeId: string; title: string },
      "resumeId"
    >(),
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="resumeId" value={resumeId} />
      <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-zinc-300"
        />
        <span>Confirm delete</span>
      </label>
      <SubmitButton pendingLabel="Deleting..." variant="destructive">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </SubmitButton>
      <span className="sr-only">Delete {title}</span>
      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
