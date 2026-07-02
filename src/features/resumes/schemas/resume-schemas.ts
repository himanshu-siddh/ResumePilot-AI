import { z } from "zod";

const resumeIdSchema = z
  .string()
  .trim()
  .min(1, "Resume id is required.")
  .max(128, "Resume id is invalid.");

export const resumeTitleSchema = z
  .string()
  .trim()
  .min(2, "Title must be at least 2 characters.")
  .max(120, "Title must be 120 characters or fewer.");

export const createResumeSchema = z.object({
  title: resumeTitleSchema,
});

export const renameResumeSchema = z.object({
  resumeId: resumeIdSchema,
  title: resumeTitleSchema,
});

export const deleteResumeSchema = z.object({
  resumeId: resumeIdSchema,
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type RenameResumeInput = z.infer<typeof renameResumeSchema>;
export type DeleteResumeInput = z.infer<typeof deleteResumeSchema>;
