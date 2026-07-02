import { BarChart3 } from "lucide-react";
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
import { formatDate } from "@/lib/format";

type AnalysisListProps = {
  analyses: {
    id: string;
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    atsScore: number | null;
    overallScore: number | null;
    summary: string | null;
    createdAt: Date;
    resumeVersion: {
      fileName: string;
      resume: {
        title: string;
      };
    };
  }[];
};

export function AnalysisList({ analyses }: AnalysisListProps) {
  if (analyses.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analyses yet"
        description="Upload a resume PDF to extract text, run Gemini analysis, and save structured ATS feedback."
        action={{
          label: "Upload resume",
          href: "/dashboard/resumes/new",
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>
          Review structured Gemini results generated from your uploaded resumes.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {analyses.map((analysis) => (
          <article
            key={analysis.id}
            className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-semibold">
                  {analysis.resumeVersion.resume.title}
                </h2>
                <Badge
                  variant={analysis.status === "COMPLETED" ? "success" : "secondary"}
                >
                  {analysis.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                {analysis.resumeVersion.fileName}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(analysis.createdAt)} / ATS{" "}
                {analysis.atsScore ?? "--"} / Overall {analysis.overallScore ?? "--"}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/analysis/${analysis.id}`}>
                View result
              </Link>
            </Button>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
