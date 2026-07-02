import { db } from "@/server/db/prisma";
import { createResumeTitle } from "@/features/resumes/utils/resume-title";

type CreateResumeFromUploadInput = {
  userId: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
};

export async function createResumeFromUpload({
  userId,
  fileName,
  fileKey,
  fileUrl,
  mimeType,
  sizeBytes,
  checksum,
}: CreateResumeFromUploadInput) {
  return db.resume.create({
    data: {
      userId,
      title: createResumeTitle(fileName),
      versions: {
        create: {
          versionNumber: 1,
          fileName,
          fileKey,
          fileUrl,
          mimeType,
          sizeBytes,
          checksum,
          status: "UPLOADED",
        },
      },
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
        take: 1,
      },
    },
  });
}

export async function createResumeDraft(userId: string, title: string) {
  return db.resume.create({
    data: {
      userId,
      title,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

export async function renameResumeForUser(
  userId: string,
  resumeId: string,
  title: string,
) {
  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!resume) {
    return null;
  }

  return db.resume.update({
    where: {
      id: resume.id,
    },
    data: {
      title,
    },
    select: {
      id: true,
      title: true,
    },
  });
}

export async function softDeleteResumeForUser(userId: string, resumeId: string) {
  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  if (!resume) {
    return null;
  }

  return db.resume.update({
    where: {
      id: resume.id,
    },
    data: {
      deletedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
    },
  });
}
