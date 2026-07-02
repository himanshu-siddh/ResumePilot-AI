import { db } from "@/server/db/prisma";

export async function getAnalysisForUser(analysisId: string, userId: string) {
  return db.resumeAnalysis.findFirst({
    where: {
      id: analysisId,
      userId,
      resumeVersion: {
        resume: {
          deletedAt: null,
        },
      },
    },
    include: {
      resumeVersion: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          sizeBytes: true,
          createdAt: true,
          resume: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      findings: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      missingSkills: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function getRecentAnalysesForUser(userId: string, limit = 10) {
  return db.resumeAnalysis.findMany({
    where: {
      userId,
      resumeVersion: {
        resume: {
          deletedAt: null,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      status: true,
      atsScore: true,
      overallScore: true,
      summary: true,
      createdAt: true,
      resumeVersion: {
        select: {
          fileName: true,
          resume: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
}
