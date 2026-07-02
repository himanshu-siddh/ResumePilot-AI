"use client";

import { MessageSquareText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { createChatThreadAction } from "@/features/chat/actions/chat-actions";
import { Button } from "@/components/ui/button";
import { createInitialActionState } from "@/types/action-result";

type CreateChatThreadFormProps = {
  resumeId: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={pending}>
      <MessageSquareText className="h-4 w-4" aria-hidden="true" />
      {pending ? "Starting..." : "Start chat"}
    </Button>
  );
}

export function CreateChatThreadForm({ resumeId }: CreateChatThreadFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createChatThreadAction,
    createInitialActionState<
      { threadId: string; title: string },
      "resumeId"
    >(),
  );

  useEffect(() => {
    if (state.ok) {
      router.push(`/dashboard/chat/${state.data.threadId}`);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="resumeId" value={resumeId} />
      <SubmitButton />
      {!state.ok && state.message ? (
        <p className="text-sm text-red-600" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
