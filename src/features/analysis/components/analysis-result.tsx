import { AlertTriangle, CheckCircle2, FileText, Sparkles, Target } from "lucide-react";
import Link from "next/link";

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

type FindingCategory =
  | "STRENGTH"
  | "WEAKNESS"
  | "GRAMMAR"
  | "FORMATTING"
  | "RECOMMENDATION";

type Finding = {
  id: string;
  category: FindingCategory;
  severity: "LOW" | "MEDIUM" | "HIGH" | null;
  title: string;
  description: string;
  beforeText: string | null;
  afterText: string | null;
};

type AnalysisResultProps = {
  analysis: {
    id: string;
    status: "PROCESSING" | "COMPLETED" | "FAILED";
    atsScore: number | null;
    overallScore: number | null;
    summary: string | null;
    errorMessage: string | null;
    model: string;
    promptVersion: string;
    createdAt: Date;
    resumeVersion: {
      fileName: string;
      fileUrl: string;
      sizeBytes: number;
      createdAt: Date;
      resume: {
        title: string;
      };
    };
    findings: Finding[];
    missingSkills: {
      id: string;
      skill: string;
      importance: "LOW" | "MEDIUM" | "HIGH";
      reason: string;
    }[];
  };
};

const categoryLabels = {
  STRENGTH: "Strengths",
  WEAKNESS: "Weaknesses",
  GRAMMAR: "Grammar",
  FORMATTING: "Formatting",
  RECOMMENDATION: "Recommendations",
} as const;

function getFindings(findings: Finding[], category: FindingCategory) {
  return findings.filter((finding) => finding.category === category);
}

function ScoreCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | null;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight">
              {value ?? "--"}
              {value !== null ? <span className="text-lg text-zinc-500">/100</span> : null}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-100 p-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function FindingsSection({
  title,
  findings,
}: {
  title: string;
  findings: Finding[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {findings.length > 0
            ? `${findings.length} item${findings.length === 1 ? "" : "s"} found`
            : "No items returned for this category."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {findings.length > 0 ? (
          findings.map((finding) => (
            <article
              key={finding.id}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="font-medium">{finding.title}</h3>
                {finding.severity ? (
                  <Badge variant="secondary">{finding.severity.toLowerCase()}</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {finding.description}
              </p>
              {finding.beforeText || finding.afterText ? (
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  {finding.beforeText ? (
                    <div className="rounded-md bg-red-50 p-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">
                      <p className="font-medium">Before</p>
                      <p className="mt-1">{finding.beforeText}</p>
                    </div>
                  ) : null}
                  {finding.afterText ? (
                    <div className="rounded-md bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <p className="font-medium">After</p>
                      <p className="mt-1">{finding.afterText}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gemini returned an empty list for this section.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  if (analysis.status === "FAILED") {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-red-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">Analysis failed</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            {analysis.errorMessage ??
              "We could not analyze this resume. Please upload a clearer PDF and try again."}
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard/resumes/new">Upload another resume</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            AI resume analysis
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {analysis.resumeVersion.resume.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {analysis.resumeVersion.fileName} / {formatBytes(analysis.resumeVersion.sizeBytes)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={analysis.status === "COMPLETED" ? "success" : "secondary"}>
            {analysis.status.toLowerCase()}
          </Badge>
          <Button variant="outline" asChild>
            <a
              href={analysis.resumeVersion.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open PDF
            </a>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <ScoreCard
          label="ATS Score"
          value={analysis.atsScore}
          description="Estimated compatibility with applicant tracking systems."
        />
        <ScoreCard
          label="Overall Score"
          value={analysis.overallScore}
          description="Combined score for content, clarity, formatting, and impact."
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Summary
          </CardTitle>
          <CardDescription>
            Generated by {analysis.model} using {analysis.promptVersion} on{" "}
            {formatDate(analysis.createdAt)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
            {analysis.summary}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" aria-hidden="true" />
            Missing Skills
          </CardTitle>
          <CardDescription>
            Skills Gemini identified as useful additions for stronger targeting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysis.missingSkills.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {analysis.missingSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{skill.skill}</h3>
                    <Badge variant="secondary">{skill.importance.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {skill.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              No missing skills returned.
            </div>
          )}
        </CardContent>
      </Card>

      {(
        [
          "STRENGTH",
          "WEAKNESS",
          "GRAMMAR",
          "FORMATTING",
          "RECOMMENDATION",
        ] as const
      ).map((category) => (
        <FindingsSection
          key={category}
          title={categoryLabels[category]}
          findings={getFindings(analysis.findings, category)}
        />
      ))}
    </div>
  );
}
