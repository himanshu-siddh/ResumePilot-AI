import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  MessageSquareText,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";
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
import { formatBytes, formatDate } from "@/lib/format";

type DashboardOverviewProps = {
  userName?: string | null;
  stats: {
    totalResumes: number;
    averageAtsScore: number | null;
    aiSuggestions: number;
    chatThreads: number;
  };
  recentResumes: {
    id: string;
    title: string;
    createdAt: Date;
    versions: {
      id: string;
      fileName: string;
      fileUrl: string;
      sizeBytes: number;
      status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED";
      analyses: {
        id: string;
        status: "PROCESSING" | "COMPLETED" | "FAILED";
        atsScore: number | null;
        overallScore: number | null;
      }[];
    }[];
  }[];
};

const checklistItems = [
  "Upload a PDF resume",
  "Run ATS and grammar analysis",
  "Review missing skills",
  "Chat with AI about improvements",
] as const;

function createStats(stats: DashboardOverviewProps["stats"]) {
  return [
    {
      label: "Total resumes",
      value: stats.totalResumes.toString(),
      helper:
        stats.totalResumes > 0
          ? "Stored in your workspace"
          : "Upload your first resume",
      icon: FileText,
    },
    {
      label: "Average ATS score",
      value: stats.averageAtsScore?.toString() ?? "--",
      helper: "Available after analysis",
      icon: Target,
    },
    {
      label: "AI suggestions",
      value: stats.aiSuggestions.toString(),
      helper: "No reviews generated yet",
      icon: Sparkles,
    },
    {
      label: "Resume chats",
      value: stats.chatThreads.toString(),
      helper: "Ask AI after uploading",
      icon: MessageSquareText,
    },
  ] as const;
}

function AtsScoreCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Average ATS Score</CardTitle>
        <CardDescription>
          Your score trend will appear after the first AI review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-6">
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-zinc-100 bg-white shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
            <div className="absolute h-32 w-32 rounded-full bg-white dark:bg-zinc-900" />
            <div className="relative text-center">
              <p className="text-4xl font-semibold tracking-tight">--</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                No score yet
              </p>
            </div>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link href="/dashboard/resumes/new">
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Upload to calculate score
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function StatCard({ stat }: { stat: ReturnType<typeof createStats>[number] }) {
  const Icon = stat.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {stat.helper}
        </p>
      </CardContent>
    </Card>
  );
}

function RecentResumeUploads({
  resumes,
}: {
  resumes: DashboardOverviewProps["recentResumes"];
}) {
  if (resumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes uploaded yet"
        description="Upload your first resume to start tracking versions, ATS scores, AI suggestions, and resume chat history."
        action={{
          label: "Upload resume",
          href: "/dashboard/resumes/new",
        }}
      />
    );
  }

  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {resumes.map((resume) => {
        const latestVersion = resume.versions[0];
        const latestAnalysis = latestVersion?.analyses[0];

        return (
          <article
            key={resume.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{resume.title}</h3>
              <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                {latestVersion?.fileName ?? "Metadata unavailable"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(resume.createdAt)}
                {latestVersion ? ` / ${formatBytes(latestVersion.sizeBytes)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0">
              {latestAnalysis?.atsScore !== null &&
              latestAnalysis?.atsScore !== undefined ? (
                <Badge variant="outline">ATS {latestAnalysis.atsScore}</Badge>
              ) : null}
              {latestVersion ? (
                <Badge variant="secondary">{latestVersion.status.toLowerCase()}</Badge>
              ) : null}
              {latestAnalysis?.status === "COMPLETED" ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/analysis/${latestAnalysis.id}`}>
                    Result
                  </Link>
                </Button>
              ) : latestVersion?.fileUrl ? (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={latestVersion.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                </Button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function DashboardOverview({
  userName,
  stats,
  recentResumes,
}: DashboardOverviewProps) {
  const dashboardStats = createStats(stats);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card className="overflow-hidden border-zinc-200 bg-gradient-to-br from-white via-white to-zinc-100 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-zinc-200/60 blur-3xl dark:bg-zinc-700/30" />
            <div className="relative max-w-2xl">
              <Badge variant="secondary">AI-powered resume workspace</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome{userName ? `, ${userName}` : ""}. Ready to tune your
                resume?
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Upload a resume to unlock ATS scoring, missing skills, grammar
                fixes, and AI coaching in one focused dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard/resumes/new">
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    Quick upload
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/analysis">
                    View analysis
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to get your first actionable review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklistItems.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  className="h-5 w-5 text-zinc-400 dark:text-zinc-600"
                  aria-hidden="true"
                />
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {item}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section
        aria-label="Dashboard statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Recent Resume Uploads</CardTitle>
              <CardDescription>
                Your latest resumes and review status will appear here.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/resumes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentResumeUploads resumes={recentResumes} />
          </CardContent>
        </Card>

        <AtsScoreCard />
      </section>
    </div>
  );
}
