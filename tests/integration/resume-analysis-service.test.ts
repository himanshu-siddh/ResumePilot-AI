import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = {
  resumeVersion: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  resumeAnalysis: {
    create: vi.fn(),
    update: vi.fn(),
  },
};

const extractPdfTextFromUrlMock = vi.fn();
const generateContentMock = vi.fn();

vi.mock("@/server/db/prisma", () => ({
  db: dbMock,
}));

vi.mock("@/features/analysis/services/pdf-text-extraction-service", () => ({
  PdfTextExtractionError: class PdfTextExtractionError extends Error {},
  extractPdfTextFromUrl: extractPdfTextFromUrlMock,
}));

vi.mock("@/server/ai/gemini", () => ({
  GEMINI_RESUME_ANALYSIS_MODEL: "gemini-2.5-flash",
  getGeminiClient: () => ({
    models: {
      generateContent: generateContentMock,
    },
  }),
}));

describe("resume analysis service", () => {
  beforeEach(() => {
    dbMock.resumeVersion.findFirst.mockReset();
    dbMock.resumeVersion.update.mockReset();
    dbMock.resumeAnalysis.create.mockReset();
    dbMock.resumeAnalysis.update.mockReset();
    extractPdfTextFromUrlMock.mockReset();
    generateContentMock.mockReset();
  });

  it("handles Gemini API failure gracefully and marks analysis failed", async () => {
    dbMock.resumeVersion.findFirst.mockResolvedValue({
      id: "version_1",
      fileUrl: "https://example.com/resume.pdf",
    });
    dbMock.resumeAnalysis.create.mockResolvedValue({ id: "analysis_1" });
    extractPdfTextFromUrlMock.mockResolvedValue("Resume text");
    generateContentMock.mockRejectedValue(new Error("API_KEY_INVALID"));
    const { runResumeAnalysis } = await import(
      "@/features/analysis/services/resume-analysis-service"
    );

    const result = await runResumeAnalysis({
      userId: "user_1",
      resumeVersionId: "version_1",
      fileUrl: "https://example.com/resume.pdf",
    });

    expect(result).toEqual({
      analysisId: "analysis_1",
      status: "FAILED",
      errorMessage: "Gemini API key is invalid. Update GEMINI_API_KEY and retry.",
    });
    expect(dbMock.resumeVersion.update).toHaveBeenLastCalledWith({
      where: { id: "version_1" },
      data: { status: "FAILED" },
    });
    expect(dbMock.resumeAnalysis.update).toHaveBeenCalledWith({
      where: { id: "analysis_1" },
      data: {
        status: "FAILED",
        errorMessage: "Gemini API key is invalid. Update GEMINI_API_KEY and retry.",
      },
    });
  });
});
