import { FileText, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateChatThreadForm } from "@/features/chat/components/create-chat-thread-form";
import { formatDate } from "@/lib/format";

type ChatIndexProps = {
  threads: {
    id: string;
    title: string;
    updatedAt: Date;
    resume: {
      id: string;
      title: string;
    };
    messages: {
      content: string;
      role: "USER" | "ASSISTANT";
      createdAt: Date;
    }[];
  }[];
  readyResumes: {
    id: string;
    title: string;
    versions: {
      fileName: string;
      status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
    }[];
  }[];
};

export function ChatIndex({ threads, readyResumes }: ChatIndexProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader>
          <CardTitle>Resume Chat History</CardTitle>
          <CardDescription>
            Conversations are scoped to the selected resume only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <EmptyState
              icon={MessageSquareText}
              title="No resume chats yet"
              description="Start a chat from a processed resume to ask grounded questions about its content."
            />
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {threads.map((thread) => {
                const latestMessage = thread.messages[0];

                return (
                  <article
                    key={thread.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        {thread.title}
                      </h2>
                      <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {latestMessage?.content ?? "No messages yet"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {thread.resume.title} / Updated {formatDate(thread.updatedAt)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/chat/${thread.id}`}>Open chat</Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Start A Resume Chat</CardTitle>
          <CardDescription>
            Only resumes with completed text extraction are available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {readyResumes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No chat-ready resumes"
              description="Upload and analyze a resume before starting a resume-grounded chat."
              action={{
                label: "Upload resume",
                href: "/dashboard/resumes/new",
              }}
            />
          ) : (
            readyResumes.map((resume) => {
              const latestVersion = resume.versions[0];

              return (
                <div
                  key={resume.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {resume.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {latestVersion?.fileName ?? "Ready for chat"}
                      </p>
                    </div>
                    <Badge variant="success">ready</Badge>
                  </div>
                  <div className="mt-4">
                    <CreateChatThreadForm resumeId={resume.id} />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
