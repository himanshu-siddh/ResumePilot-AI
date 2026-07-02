import type { Metadata } from "next";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import {
  getRecentUserResumes,
  getUserResumeStats,
} from "@/features/resumes/queries/resume-queries";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, recentResumes] = await Promise.all([
    getUserResumeStats(user.id),
    getRecentUserResumes(user.id, 3),
  ]);

  return (
    <DashboardOverview
      userName={user.name}
      stats={stats}
      recentResumes={recentResumes}
    />
  );
}
