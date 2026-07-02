import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnalysisResult } from "@/features/analysis/components/analysis-result";
import { getAnalysisForUser } from "@/features/analysis/queries/analysis-queries";
import { requireUser } from "@/server/auth/session";

type AnalysisPageProps = {
  params: Promise<{
    analysisId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Analysis Result",
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const [{ analysisId }, user] = await Promise.all([params, requireUser()]);
  const analysis = await getAnalysisForUser(analysisId, user.id);

  if (!analysis) {
    notFound();
  }

  return <AnalysisResult analysis={analysis} />;
}
