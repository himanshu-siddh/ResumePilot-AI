"use server";

import { revalidatePath } from "next/cache";

import {
  createResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
} from "@/features/resumes/schemas/resume-schemas";
import {
  createResumeDraft,
  renameResumeForUser,
  softDeleteResumeForUser,
} from "@/features/resumes/services/resume-service";
import { readFormString } from "@/lib/form-data";
import { getAuthenticatedUserId } from "@/server/auth/action-user";
import type { ActionResult } from "@/types/action-result";

type CreateResumeFields = "title";
type RenameResumeFields = "resumeId" | "title";
type DeleteResumeFields = "resumeId";

type ResumeActionData = {
  resumeId: string;
  title: string;
};

function revalidateResumeViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resumes");
  revalidatePath("/dashboard/analysis");
  revalidatePath("/dashboard/chat");
}

export async function createResumeAction(
  _previousState: ActionResult<ResumeActionData, CreateResumeFields>,
  formData: FormData,
): Promise<ActionResult<ResumeActionData, CreateResumeFields>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false,
      message: "You must be signed in to create a resume.",
    };
  }

  const parsed = createResumeSchema.safeParse({
    title: readFormString(formData, "title"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const resume = await createResumeDraft(userId, parsed.data.title);
    revalidateResumeViews();

    return {
      ok: true,
      message: "Resume draft created.",
      data: {
        resumeId: resume.id,
        title: resume.title,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Could not create the resume. Please try again.",
    };
  }
}

export async function renameResumeAction(
  _previousState: ActionResult<ResumeActionData, RenameResumeFields>,
  formData: FormData,
): Promise<ActionResult<ResumeActionData, RenameResumeFields>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false,
      message: "You must be signed in to rename a resume.",
    };
  }

  const parsed = renameResumeSchema.safeParse({
    resumeId: readFormString(formData, "resumeId"),
    title: readFormString(formData, "title"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const resume = await renameResumeForUser(
      userId,
      parsed.data.resumeId,
      parsed.data.title,
    );

    if (!resume) {
      return {
        ok: false,
        message: "Resume not found or you do not have access.",
      };
    }

    revalidateResumeViews();

    return {
      ok: true,
      message: "Resume renamed.",
      data: {
        resumeId: resume.id,
        title: resume.title,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Could not rename the resume. Please try again.",
    };
  }
}

export async function deleteResumeAction(
  _previousState: ActionResult<ResumeActionData, DeleteResumeFields>,
  formData: FormData,
): Promise<ActionResult<ResumeActionData, DeleteResumeFields>> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ok: false,
      message: "You must be signed in to delete a resume.",
    };
  }

  const parsed = deleteResumeSchema.safeParse({
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
    const resume = await softDeleteResumeForUser(userId, parsed.data.resumeId);

    if (!resume) {
      return {
        ok: false,
        message: "Resume not found or you do not have access.",
      };
    }

    revalidateResumeViews();

    return {
      ok: true,
      message: "Resume deleted.",
      data: {
        resumeId: resume.id,
        title: resume.title,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Could not delete the resume. Please try again.",
    };
  }
}
