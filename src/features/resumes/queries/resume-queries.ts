import { db } from "@/server/db/prisma";

export async function getUserResumeStats(userId: string) {
  const [totalResumes, averageScores, aiSuggestions, chatThreads] =
    await Promise.all([
      db.resume.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
      db.resumeAnalysis.aggregate({
        where: {
          userId,
          status: "COMPLETED",
          resumeVersion: {
            resume: {
              deletedAt: null,
            },
          },
        },
        _avg: {
          atsScore: true,
        },
      }),
      db.analysisFinding.count({
        where: {
          analysis: {
            userId,
            status: "COMPLETED",
            resumeVersion: {
              resume: {
                deletedAt: null,
              },
            },
          },
          category: "RECOMMENDATION",
        },
      }),
      db.chatThread.count({
        where: {
          userId,
          resume: {
            deletedAt: null,
          },
        },
      }),
    ]);

  return {
    totalResumes,
    averageAtsScore: averageScores._avg.atsScore
      ? Math.round(averageScores._avg.atsScore)
      : null,
    aiSuggestions,
    chatThreads,
  };
}

export async function getRecentUserResumes(userId: string, limit = 5) {
  return db.resume.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      title: true,
      createdAt: true,
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
        take: 1,
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          sizeBytes: true,
          status: true,
          createdAt: true,
          analyses: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              status: true,
              atsScore: true,
              overallScore: true,
            },
          },
        },
      },
    },
  });
}
