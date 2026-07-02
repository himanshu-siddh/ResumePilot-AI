import { db } from "@/server/db/prisma";
import {
  GEMINI_RESUME_ANALYSIS_MODEL,
  getGeminiClient,
} from "@/server/ai/gemini";
import {
  RESUME_ANALYSIS_PROMPT_VERSION,
  buildResumeAnalysisPrompt,
  resumeAnalysisJsonSchema,
} from "@/features/analysis/prompts/resume-analysis-prompt";
import {
  type ResumeAnalysisOutput,
  resumeAnalysisOutputSchema,
} from "@/features/analysis/schemas/analysis-output-schema";
import {
  PdfTextExtractionError,
  extractPdfTextFromUrl,
} from "@/features/analysis/services/pdf-text-extraction-service";
import { parseJsonObject } from "@/features/analysis/utils/json";

const MAX_RESUME_TEXT_FOR_MODEL = 24_000;

type RunResumeAnalysisInput = {
  userId: string;
  resumeVersionId: string;
  fileUrl: string;
};

type FindingCategory =
  | "STRENGTH"
  | "WEAKNESS"
  | "GRAMMAR"
  | "FORMATTING"
  | "RECOMMENDATION";

const severityMap = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
} as const;

function truncateForModel(text: string) {
  if (text.length <= MAX_RESUME_TEXT_FOR_MODEL) {
    return text;
  }

  return `${text.slice(0, MAX_RESUME_TEXT_FOR_MODEL)}\n\n[Resume text truncated for analysis due to length.]`;
}

async function analyzeTextWithGemini(resumeText: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: GEMINI_RESUME_ANALYSIS_MODEL,
    contents: buildResumeAnalysisPrompt(truncateForModel(resumeText)),
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseJsonSchema: resumeAnalysisJsonSchema,
    },
  });

  const text = response.text;

  if (!text) {
    throw new Error("Gemini did not return analysis text.");
  }

  const parsed = parseJsonObject(text);

  return resumeAnalysisOutputSchema.parse(parsed);
}

function createFindingRows(
  analysis: ResumeAnalysisOutput,
  category: FindingCategory,
) {
  const source =
    category === "STRENGTH"
      ? analysis.strengths
      : category === "WEAKNESS"
        ? analysis.weaknesses
        : category === "GRAMMAR"
          ? analysis.grammar
          : category === "FORMATTING"
            ? analysis.formatting
            : analysis.recommendations;

  return source.map((finding, index) => ({
    category,
    severity: finding.severity ? severityMap[finding.severity] : null,
    title: finding.title,
    description: finding.description,
    beforeText: finding.beforeText,
    afterText: finding.afterText,
    sortOrder: index,
  }));
}

function getSafeAnalysisErrorMessage(error: unknown) {
  if (error instanceof PdfTextExtractionError) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes("API_KEY_INVALID")) {
    return "Gemini API key is invalid. Update GEMINI_API_KEY and retry.";
  }

  if (
    error instanceof Error &&
    error.message.includes("Please pass a valid API key")
  ) {
    return "Gemini API key is invalid. Update GEMINI_API_KEY and retry.";
  }

  if (error instanceof SyntaxError) {
    return "AI analysis returned invalid JSON.";
  }

  if (error instanceof Error) {
    return "Resume analysis failed. Please try again.";
  }

  return "Resume analysis failed.";
}

export async function runResumeAnalysis({
  userId,
  resumeVersionId,
  fileUrl,
}: RunResumeAnalysisInput) {
  let analysisId: string | null = null;

  try {
    const resumeVersion = await db.resumeVersion.findFirst({
      where: {
        id: resumeVersionId,
        resume: {
          userId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        fileUrl: true,
      },
    });

    if (!resumeVersion) {
      return {
        analysisId: null,
        status: "FAILED" as const,
        errorMessage: "Resume version not found or access denied.",
      };
    }

    await db.resumeVersion.update({
      where: {
        id: resumeVersion.id,
      },
      data: {
        status: "PROCESSING",
      },
    });

    const analysis = await db.resumeAnalysis.create({
      data: {
        userId,
        resumeVersionId: resumeVersion.id,
        status: "PROCESSING",
        model: GEMINI_RESUME_ANALYSIS_MODEL,
        promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
      },
      select: {
        id: true,
      },
    });
    analysisId = analysis.id;

    const extractedText = await extractPdfTextFromUrl(resumeVersion.fileUrl || fileUrl);
    const modelAnalysis = await analyzeTextWithGemini(extractedText);

    const findings = [
      ...createFindingRows(modelAnalysis, "STRENGTH"),
      ...createFindingRows(modelAnalysis, "WEAKNESS"),
      ...createFindingRows(modelAnalysis, "GRAMMAR"),
      ...createFindingRows(modelAnalysis, "FORMATTING"),
      ...createFindingRows(modelAnalysis, "RECOMMENDATION"),
    ];

    await db.resumeVersion.update({
      where: {
        id: resumeVersionId,
      },
      data: {
        status: "READY",
        extractedText,
      },
    });

    await db.resumeAnalysis.update({
      where: {
        id: analysisId,
      },
      data: {
        status: "COMPLETED",
        atsScore: modelAnalysis.atsScore,
        overallScore: modelAnalysis.overallScore,
        summary: modelAnalysis.summary,
        findings: {
          create: findings,
        },
        missingSkills: {
          create: modelAnalysis.missingSkills.map((skill) => ({
            skill: skill.skill,
            importance: severityMap[skill.importance],
            reason: skill.reason,
          })),
        },
      },
    });

    return {
      analysisId,
      status: "COMPLETED" as const,
    };
  } catch (error) {
    const errorMessage = getSafeAnalysisErrorMessage(error);

    if (process.env.NODE_ENV === "development") {
      console.error("Resume analysis failed", {
        resumeVersionId,
        error,
      });
    }

    await db.resumeVersion.update({
      where: {
        id: resumeVersionId,
      },
      data: {
        status: "FAILED",
      },
    });

    if (analysisId) {
      await db.resumeAnalysis.update({
        where: {
          id: analysisId,
        },
        data: {
          status: "FAILED",
          errorMessage,
        },
      });
    }

    return {
      analysisId,
      status: "FAILED" as const,
      errorMessage,
    };
  }
}
