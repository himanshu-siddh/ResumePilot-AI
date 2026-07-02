import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatThreadView } from "@/features/chat/components/chat-thread-view";
import { getChatThreadForUser } from "@/features/chat/queries/chat-queries";
import { requireUser } from "@/server/auth/session";

type ChatThreadPageProps = {
  params: Promise<{
    threadId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Resume Chat",
};

export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const [{ threadId }, user] = await Promise.all([params, requireUser()]);
  const thread = await getChatThreadForUser(threadId, user.id);

  if (!thread) {
    notFound();
  }

  return <ChatThreadView thread={thread} />;
}
