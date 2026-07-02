import type { Metadata } from "next";

import { ChatIndex } from "@/features/chat/components/chat-index";
import {
  getChatReadyResumesForUser,
  getChatThreadsForUser,
} from "@/features/chat/queries/chat-queries";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Resume Chat",
};

export default async function ChatPage() {
  const user = await requireUser();
  const [threads, readyResumes] = await Promise.all([
    getChatThreadsForUser(user.id),
    getChatReadyResumesForUser(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Resume-aware AI
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Chat with your resume
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Ask questions grounded only in a selected resume. The assistant uses
          bounded resume text and recent chat history to reduce hallucinations.
        </p>
      </div>

      <ChatIndex threads={threads} readyResumes={readyResumes} />
    </div>
  );
}
