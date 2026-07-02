import type { Metadata } from "next";
import Link from "next/link";

import { ResumeUploadDropzone } from "@/features/resumes/components/resume-upload-dropzone";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Upload Resume",
};

export default function NewResumePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Resume upload
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Upload your resume
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Add a PDF resume to your private workspace. We will store the upload
            metadata now and use it for ATS analysis in the next step.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/resumes">View uploads</Link>
        </Button>
      </div>

      <ResumeUploadDropzone />
    </div>
  );
}
