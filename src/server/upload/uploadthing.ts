import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { revalidatePath } from "next/cache";

import {
  RESUME_UPLOAD_MAX_BYTES,
  RESUME_UPLOAD_MIME_TYPE,
} from "@/features/resumes/constants/upload-limits";
import { runResumeAnalysis } from "@/features/analysis/services/resume-analysis-service";
import { createResumeFromUpload } from "@/features/resumes/services/resume-service";
import { auth } from "@/server/auth";

const uploadthing = createUploadthing();

export const uploadRouter = {
  resumeUploader: uploadthing(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    {
      awaitServerData: true,
    },
  )
    .middleware(async ({ files }) => {
      const session = await auth();
      const userId = session?.user?.id;

      if (!userId) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "You must be signed in to upload a resume.",
        });
      }

      const [file] = files;

      if (!file || files.length !== 1) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Upload exactly one resume.",
        });
      }

      if (file.type !== RESUME_UPLOAD_MIME_TYPE) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Only PDF resumes are supported.",
        });
      }

      if (file.size > RESUME_UPLOAD_MAX_BYTES) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Resume PDF must be 5MB or smaller.",
        });
      }

      return {
        userId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const resume = await createResumeFromUpload({
        userId: metadata.userId,
        fileName: file.name,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        checksum: file.fileHash,
      });
      const [version] = resume.versions;

      if (!version) {
        throw new UploadThingError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Resume metadata could not be saved.",
        });
      }

      const analysis = await runResumeAnalysis({
        userId: metadata.userId,
        resumeVersionId: version.id,
        fileUrl: version.fileUrl,
      });

      revalidatePath("/dashboard");
      revalidatePath("/dashboard/resumes");
      revalidatePath("/dashboard/analysis");
      revalidatePath("/dashboard/chat");

      return {
        resumeId: resume.id,
        resumeVersionId: version.id,
        analysisId: analysis.analysisId,
        analysisStatus: analysis.status,
        analysisError: analysis.status === "FAILED" ? analysis.errorMessage : null,
        title: resume.title,
        status: analysis.status === "COMPLETED" ? "READY" : "FAILED",
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadRouteHandlers = createRouteHandler({
  router: uploadRouter,
});
