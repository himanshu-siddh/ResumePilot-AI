import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);

export const createChatThreadSchema = z.object({
  resumeId: idSchema,
});

export const sendChatMessageSchema = z.object({
  threadId: idSchema,
  message: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters.")
    .max(1200, "Message must be 1200 characters or fewer."),
});

export type CreateChatThreadInput = z.infer<typeof createChatThreadSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
