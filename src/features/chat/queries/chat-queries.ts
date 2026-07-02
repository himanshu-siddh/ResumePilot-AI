import { db } from "@/server/db/prisma";

export async function getChatThreadsForUser(userId: string) {
  return db.chatThread.findMany({
    where: {
      userId,
      resume: {
        deletedAt: null,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      resume: {
        select: {
          id: true,
          title: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          content: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getChatThreadForUser(threadId: string, userId: string) {
  return db.chatThread.findFirst({
    where: {
      id: threadId,
      userId,
      resume: {
        deletedAt: null,
      },
    },
    select: {
      id: true,
      title: true,
      resume: {
        select: {
          id: true,
          title: true,
          versions: {
            orderBy: {
              versionNumber: "desc",
            },
            take: 1,
            select: {
              status: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          role: true,
          content: true,
          model: true,
        },
      },
    },
  });
}

export async function getChatReadyResumesForUser(userId: string) {
  return db.resume.findMany({
    where: {
      userId,
      deletedAt: null,
      versions: {
        some: {
          status: "READY",
          extractedText: {
            not: null,
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
        take: 1,
        select: {
          fileName: true,
          status: true,
        },
      },
    },
  });
}
