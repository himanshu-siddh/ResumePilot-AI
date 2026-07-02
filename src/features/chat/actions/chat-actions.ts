"use server";

import { revalidatePath } from "next/cache";

import {
  createChatThreadSchema,
  sendChatMessageSchema,
} from "@/features/chat/schemas/chat-schemas";
import {
  createResumeChatThread,
  sendResumeChatMessage,
} from "@/features/chat/services/chat-service";
import { readFormString } from "@/lib/form-data";
import { getAuthenticatedUserId } from "@/server/auth/action-user";
import type { ActionResult } from "@/types/action-result";

type CreateThreadFields = "resumeId";
type SendMessageFields = "threadId" | "message";

type CreateThreadData = {
  threadId: string;
  title: string;
};

type SendMessageData = {
  assistantMessage: string;
};

export async function createChatThreadAction(
  _previousState: ActionResult<CreateThreadData, CreateThreadFields>,
  formData: FormData,
): Promise<ActionResult<CreateThreadData, CreateThreadFields>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false,
      message: "You must be signed in to start a chat.",
    };
  }

  const parsed = createChatThreadSchema.safeParse({
    resumeId: readFormString(formData, "resumeId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invalid resume selected.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await createResumeChatThread({
      userId,
      resumeId: parsed.data.resumeId,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
      };
    }

    revalidatePath("/dashboard/chat");

    return {
      ok: true,
      message: "Chat thread created.",
      data: {
        threadId: result.thread.id,
        title: result.thread.title,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Could not start chat. Please try again.",
    };
  }
}

export async function sendChatMessageAction(
  _previousState: ActionResult<SendMessageData, SendMessageFields>,
  formData: FormData,
): Promise<ActionResult<SendMessageData, SendMessageFields>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false,
      message: "You must be signed in to send a message.",
    };
  }

  const parsed = sendChatMessageSchema.safeParse({
    threadId: readFormString(formData, "threadId"),
    message: readFormString(formData, "message"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await sendResumeChatMessage({
      userId,
      threadId: parsed.data.threadId,
      message: parsed.data.message,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
      };
    }

    revalidatePath(`/dashboard/chat/${parsed.data.threadId}`);
    revalidatePath("/dashboard/chat");
    revalidatePath("/dashboard");

    return {
      ok: true,
      message: "Message sent.",
      data: {
        assistantMessage: result.message,
      },
    };
  } catch {
    revalidatePath(`/dashboard/chat/${parsed.data.threadId}`);
    revalidatePath("/dashboard/chat");

    return {
      ok: false,
      message: "Could not send message. Please try again.",
    };
  }
}
