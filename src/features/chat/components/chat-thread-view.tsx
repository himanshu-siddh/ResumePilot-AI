"use client";

import { Bot, Send, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { sendChatMessageAction } from "@/features/chat/actions/chat-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createInitialActionState } from "@/types/action-result";

type ChatThreadViewProps = {
  thread: {
    id: string;
    title: string;
    resume: {
      title: string;
      versions: {
        status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
      }[];
    };
    messages: {
      id: string;
      role: "USER" | "ASSISTANT";
      content: string;
      model: string | null;
    }[];
  };
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Send className="h-4 w-4" aria-hidden="true" />
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}

export function ChatThreadView({ thread }: ChatThreadViewProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    sendChatMessageAction,
    createInitialActionState<
      { assistantMessage: string },
      "threadId" | "message"
    >(),
  );
  const messageErrors = !state.ok ? state.fieldErrors?.message : undefined;
  const latestVersion = thread.resume.versions[0];
  const isChatReady = latestVersion?.status === "READY";

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Resume-scoped AI chat
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {thread.resume.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Answers are limited to this resume and recent conversation context.
          </p>
        </div>
        <Badge variant={isChatReady ? "success" : "warning"}>
          {isChatReady ? "context ready" : "context unavailable"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{thread.title}</CardTitle>
          <CardDescription>
            Ask about skills, experience, gaps, wording, or evidence from this
            resume only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            {thread.messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <Bot className="mx-auto h-8 w-8 text-zinc-400" aria-hidden="true" />
                <h2 className="mt-3 font-semibold">Start with a question</h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Example: What skills are strongest in this resume?
                </p>
              </div>
            ) : (
              thread.messages.map((message) => {
                const isUser = message.role === "USER";
                const Icon = isUser ? User : Bot;

                return (
                  <article
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isUser && "justify-end",
                    )}
                  >
                    {!isUser ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
                        isUser
                          ? "bg-zinc-950 text-white dark:bg-zinc-900 dark:text-white"
                          : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
                      )}
                    >
                      {message.content}
                    </div>
                    {isUser ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-zinc-900 dark:text-white">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>

          <form ref={formRef} action={formAction} className="space-y-3">
            <input type="hidden" name="threadId" value={thread.id} />
            <label htmlFor="message" className="sr-only">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              disabled={!isChatReady}
              placeholder={
                isChatReady
                  ? "Ask a question about this resume..."
                  : "Run analysis before chatting with this resume."
              }
              aria-describedby={messageErrors ? "message-error" : undefined}
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950"
            />
            {messageErrors ? (
              <p id="message-error" className="text-sm text-red-600">
                {messageErrors[0]}
              </p>
            ) : null}
            {!state.ok && state.message ? (
              <p className="text-sm text-red-600" role="alert">
                {state.message}
              </p>
            ) : null}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                The AI will decline questions not supported by this resume.
              </p>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
