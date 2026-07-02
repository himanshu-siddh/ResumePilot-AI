"use client";

import { CheckCircle2, FileUp, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  RESUME_UPLOAD_MAX_BYTES,
  RESUME_UPLOAD_MAX_MB,
  RESUME_UPLOAD_MIME_TYPE,
} from "@/features/resumes/constants/upload-limits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";

type UploadStatus = "idle" | "validating" | "uploading" | "saving" | "success" | "error";

type UploadResult = {
  resumeId: string;
  analysisId: string | null;
  analysisStatus: "COMPLETED" | "FAILED";
  title: string;
  status: string;
};

function validateResumeFile(file: File) {
  if (file.type !== RESUME_UPLOAD_MIME_TYPE) {
    return "Only PDF files are supported.";
  }

  if (file.size > RESUME_UPLOAD_MAX_BYTES) {
    return `Resume PDF must be ${RESUME_UPLOAD_MAX_MB}MB or smaller.`;
  }

  return null;
}

export function ResumeUploadDropzone() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const isUploading = status === "validating" || status === "uploading" || status === "saving";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex min-h-80 flex-col items-center justify-center bg-transparent p-8 text-center">
            <UploadCloud className="h-14 w-14 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
            <p className="mt-5 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Select your resume PDF
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              PDF only. Maximum {RESUME_UPLOAD_MAX_MB}MB. Upload starts as soon as
              you choose a file.
            </p>
            <UploadButton
              endpoint="resumeUploader"
              uploadProgressGranularity="fine"
              disabled={isUploading}
              onBeforeUploadBegin={(files) => {
                setStatus("validating");
                setMessage(null);
                setResult(null);
                setProgress(0);

                const [file] = files;

                if (!file || files.length !== 1) {
                  const errorMessage = "Upload exactly one resume PDF.";
                  setStatus("error");
                  setMessage(errorMessage);
                  throw new Error(errorMessage);
                }

                const validationMessage = validateResumeFile(file);

                if (validationMessage) {
                  setStatus("error");
                  setMessage(validationMessage);
                  throw new Error(validationMessage);
                }

                return files;
              }}
              onUploadBegin={() => {
                setStatus("uploading");
                setMessage("Uploading your resume securely...");
              }}
              onUploadProgress={(uploadProgress) => {
                setProgress(uploadProgress);
                setStatus(uploadProgress >= 100 ? "saving" : "uploading");
              }}
              onClientUploadComplete={(response) => {
                const serverData = response[0]?.serverData;

                if (!serverData) {
                  setStatus("error");
                  setMessage("Upload finished, but metadata was not returned.");
                  return;
                }

                setStatus("success");
                setProgress(100);
                setMessage(
                  serverData.analysisStatus === "COMPLETED"
                    ? "Resume uploaded, analyzed, and saved successfully."
                    : serverData.analysisError ??
                      "Resume uploaded, but AI analysis could not be completed.",
                );
                setResult({
                  resumeId: serverData.resumeId,
                  analysisId: serverData.analysisId,
                  analysisStatus: serverData.analysisStatus,
                  title: serverData.title,
                  status: serverData.status,
                });
                router.refresh();
              }}
              onUploadError={(error) => {
                setStatus("error");
                setMessage(error.message || "Resume upload failed. Please try again.");
                setProgress(0);
              }}
              appearance={{
                container: "mt-6 flex flex-col items-center gap-3",
                allowedContent: "text-sm text-zinc-500 dark:text-zinc-400",
                button:
                  "h-11 rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800",
                clearBtn:
                  "text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
              }}
              content={{
                allowedContent: () =>
                  `PDF only. Maximum ${RESUME_UPLOAD_MAX_MB}MB.`,
                button: ({ ready, isUploading: uploadthingIsUploading, files }) => {
                  if (!ready) {
                    return "Preparing...";
                  }

                  if (uploadthingIsUploading || isUploading) {
                    return "Uploading...";
                  }

                  if (files.length > 0) {
                    return "Starting upload...";
                  }

                  return "Choose PDF";
                },
                clearBtn: () => "Clear",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              ) : status === "error" ? (
                <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
              ) : (
                <FileUp className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Upload status</p>
              <p
                className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
                role={status === "error" ? "alert" : "status"}
              >
                {message ?? "Waiting for a PDF resume."}
              </p>
            </div>
          </div>

          {result ? (
            <Button variant="outline" asChild>
              <Link
                href={
                  result.analysisStatus === "COMPLETED" && result.analysisId
                    ? `/dashboard/analysis/${result.analysisId}`
                    : "/dashboard/resumes"
                }
              >
                {result.analysisStatus === "COMPLETED"
                  ? "View analysis"
                  : "View uploads"}
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{status === "saving" ? "Analyzing resume" : "Progress"}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              role="progressbar"
              aria-label="Resume upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="h-full rounded-full bg-zinc-950 transition-all duration-300 dark:bg-zinc-50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["PDF only", "We reject non-PDF files on both the client and server."],
          ["5MB max", "Large files are blocked before upload and on the server."],
          ["AI analysis", "Text is extracted and sent to Gemini as structured JSON."],
        ].map(([title, description]) => (
          <div
            key={title}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <ShieldCheck className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
