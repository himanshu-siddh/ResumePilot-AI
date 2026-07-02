import { db } from "@/server/db/prisma";
import {
  GEMINI_RESUME_CHAT_MODEL,
  getGeminiClient,
} from "@/server/ai/gemini";
import {
  RESUME_CHAT_PROMPT_VERSION,
  buildResumeChatPrompt,
} from "@/features/chat/prompts/resume-chat-prompt";

const MAX_RESUME_CONTEXT_CHARS = 18_000;
const RECENT_MESSAGE_LIMIT = 8;

type CreateThreadInput = {
  userId: string;
  resumeId: string;
};

type SendMessageInput = {
  userId: string;
  threadId: string;
  message: string;
};

function limitText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n\n[Context truncated due to length.]`;
}

function createThreadTitle(resumeTitle: string) {
  return `Chat about ${resumeTitle}`.slice(0, 120);
}

export async function createResumeChatThread({
  userId,
  resumeId,
}: CreateThreadInput) {
  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId,
      deletedAt: null,
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
          extractedText: true,
          status: true,
        },
      },
    },
  });

  if (!resume) {
    return {
      ok: false as const,
      message: "Resume not found or you do not have access.",
    };
  }

  const latestVersion = resume.versions[0];

  if (!latestVersion?.extractedText || latestVersion.status !== "READY") {
    return {
      ok: false as const,
      message:
        "This resume needs a completed AI analysis before chat is available.",
    };
  }

  const thread = await db.chatThread.create({
    data: {
      userId,
      resumeId: resume.id,
      title: createThreadTitle(resume.title),
    },
    select: {
      id: true,
      title: true,
    },
  });

  return {
    ok: true as const,
    thread,
  };
}

async function getThreadContext(userId: string, threadId: string) {
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
              extractedText: true,
              status: true,
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: RECENT_MESSAGE_LIMIT,
        select: {
          role: true,
          content: true,
        },
      },
    },
  });
}

export async function sendResumeChatMessage({
  userId,
  threadId,
  message,
}: SendMessageInput) {
  const thread = await getThreadContext(userId, threadId);

  if (!thread) {
    return {
      ok: false as const,
      message: "Chat thread not found or you do not have access.",
    };
  }

  const latestVersion = thread.resume.versions[0];

  if (!latestVersion?.extractedText || latestVersion.status !== "READY") {
    return {
      ok: false as const,
      message: "Resume context is not available for chat.",
    };
  }

  const recentMessages = [...thread.messages].reverse();
  const prompt = buildResumeChatPrompt({
    resumeTitle: thread.resume.title,
    resumeText: limitText(latestVersion.extractedText, MAX_RESUME_CONTEXT_CHARS),
    recentMessages,
    userQuestion: message,
  });

  await db.$transaction([
    db.chatMessage.create({
      data: {
        threadId,
        role: "USER",
        content: message,
      },
    }),
    db.chatThread.update({
      where: {
        id: threadId,
      },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_RESUME_CHAT_MODEL,
    contents: prompt,
    config: {
      temperature: 0.15,
      maxOutputTokens: 700,
    },
  });
  const assistantMessage =
    response.text?.trim() ||
    "I could not generate an answer from the available resume context.";

  await db.$transaction([
    db.chatMessage.create({
      data: {
        threadId,
        role: "ASSISTANT",
        content: assistantMessage,
        model: `${GEMINI_RESUME_CHAT_MODEL}:${RESUME_CHAT_PROMPT_VERSION}`,
      },
    }),
    db.chatThread.update({
      where: {
        id: threadId,
      },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);

  return {
    ok: true as const,
    message: assistantMessage,
  };
}
