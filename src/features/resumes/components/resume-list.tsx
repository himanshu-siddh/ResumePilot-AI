import { FileText, UploadCloud } from "lucide-react";
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
import {
  ResumeDeleteForm,
  ResumeRenameForm,
} from "@/features/resumes/components/resume-crud-forms";
import { CreateChatThreadForm } from "@/features/chat/components/create-chat-thread-form";
import { formatBytes, formatDate } from "@/lib/format";

type ResumeListItem = {
  id: string;
  title: string;
  createdAt: Date;
  versions: {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
    createdAt: Date;
    analyses: {
      id: string;
      status: "PROCESSING" | "COMPLETED" | "FAILED";
      atsScore: number | null;
      overallScore: number | null;
    }[];
  }[];
};

type ResumeListProps = {
  resumes: ResumeListItem[];
};

function getStatusBadgeVariant(status: ResumeListItem["versions"][number]["status"]) {
  if (status === "FAILED") {
    return "warning";
  }

  if (status === "READY") {
    return "success";
  }

  return "secondary";
}

export function ResumeList({ resumes }: ResumeListProps) {
  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes uploaded yet"
        description="Upload a PDF resume to start building your resume history and prepare it for ATS analysis."
        action={{
          label: "Upload resume",
          href: "/dashboard/resumes/new",
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Resume Uploads</CardTitle>
          <CardDescription>
            Stored PDF metadata for your private workspace.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/resumes/new">
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Upload resume
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {resumes.map((resume) => {
            const latestVersion = resume.versions[0];
            const latestAnalysis = latestVersion?.analyses[0];

            return (
              <article
                key={resume.id}
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">
                      {resume.title}
                    </h2>
                    <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                      {latestVersion?.fileName ?? "Metadata unavailable"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{formatDate(resume.createdAt)}</span>
                      {latestVersion ? (
                        <>
                          <span aria-hidden="true">/</span>
                          <span>{formatBytes(latestVersion.sizeBytes)}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-3 sm:w-[420px] sm:shrink-0">
                  <ResumeRenameForm resumeId={resume.id} title={resume.title} />
                  <div className="flex flex-wrap items-center gap-3">
                    {latestAnalysis?.atsScore !== null &&
                    latestAnalysis?.atsScore !== undefined ? (
                      <Badge variant="outline">
                        ATS {latestAnalysis.atsScore}
                      </Badge>
                    ) : null}
                    {latestVersion ? (
                      <Badge variant={getStatusBadgeVariant(latestVersion.status)}>
                        {latestVersion.status.toLowerCase()}
                      </Badge>
                    ) : null}
                    {latestAnalysis?.status === "COMPLETED" ? (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/analysis/${latestAnalysis.id}`}>
                          View analysis
                        </Link>
                      </Button>
                    ) : latestVersion?.fileUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={latestVersion.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open PDF
                        </a>
                      </Button>
                    ) : null}
                    {latestVersion?.status === "READY" ? (
                      <CreateChatThreadForm resumeId={resume.id} />
                    ) : null}
                    <ResumeDeleteForm resumeId={resume.id} title={resume.title} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
