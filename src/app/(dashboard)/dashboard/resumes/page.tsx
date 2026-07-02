import type { Metadata } from "next";

import { CreateResumeDraftForm } from "@/features/resumes/components/resume-crud-forms";
import { ResumeList } from "@/features/resumes/components/resume-list";
import { getRecentUserResumes } from "@/features/resumes/queries/resume-queries";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Resumes",
};

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await getRecentUserResumes(user.id, 20);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Resume history
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Uploaded resumes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Review the PDF files stored for your account. Analysis and version
          comparison will build on this metadata.
        </p>
      </div>

      <CreateResumeDraftForm />
      <ResumeList resumes={resumes} />
    </div>
  );
}
