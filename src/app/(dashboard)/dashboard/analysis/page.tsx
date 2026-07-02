import type { Metadata } from "next";

import { AnalysisList } from "@/features/analysis/components/analysis-list";
import { getRecentAnalysesForUser } from "@/features/analysis/queries/analysis-queries";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "AI Analysis",
};

export default async function AnalysisIndexPage() {
  const user = await requireUser();
  const analyses = await getRecentAnalysesForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Gemini analysis
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          AI resume results
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Review ATS scores, missing skills, grammar feedback, formatting
          issues, and recommendations generated from uploaded PDFs.
        </p>
      </div>

      <AnalysisList analyses={analyses} />
    </div>
  );
}
