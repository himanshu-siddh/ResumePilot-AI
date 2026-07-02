import { describe, expect, it } from "vitest";

import {
  RESUME_UPLOAD_MAX_BYTES,
  RESUME_UPLOAD_MIME_TYPE,
} from "@/features/resumes/constants/upload-limits";
import {
  createResumeSchema,
  deleteResumeSchema,
  renameResumeSchema,
} from "@/features/resumes/schemas/resume-schemas";

function validateResumeFile(file: { type: string; size: number }) {
  if (file.type !== RESUME_UPLOAD_MIME_TYPE) {
    return "Only PDF files are supported.";
  }

  if (file.size > RESUME_UPLOAD_MAX_BYTES) {
    return "Resume PDF must be 5MB or smaller.";
  }

  return null;
}

describe("resume validation", () => {
  it("rejects invalid file types", () => {
    expect(validateResumeFile({ type: "image/png", size: 100 })).toMatch(/PDF/);
  });

  it("rejects oversized files", () => {
    expect(
      validateResumeFile({
        type: RESUME_UPLOAD_MIME_TYPE,
        size: RESUME_UPLOAD_MAX_BYTES + 1,
      }),
    ).toMatch(/5MB/);
  });

  it("validates required create and rename fields", () => {
    expect(createResumeSchema.safeParse({ title: "" }).success).toBe(false);
    expect(
      renameResumeSchema.safeParse({ resumeId: "", title: "Updated Resume" }).success,
    ).toBe(false);
    expect(deleteResumeSchema.safeParse({ resumeId: "" }).success).toBe(false);
  });
});
