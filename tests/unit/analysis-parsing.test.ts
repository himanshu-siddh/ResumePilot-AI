import { describe, expect, it } from "vitest";

import { resumeAnalysisOutputSchema } from "@/features/analysis/schemas/analysis-output-schema";
import { parseJsonObject } from "@/features/analysis/utils/json";

const validAnalysis = {
  atsScore: 82,
  overallScore: 78,
  summary: "Strong frontend resume with room for more measurable impact.",
  strengths: [
    {
      title: "Strong React experience",
      description: "The resume highlights React and Next.js work clearly.",
      severity: "low",
    },
  ],
  weaknesses: [],
  missingSkills: [
    {
      skill: "Testing",
      importance: "medium",
      reason: "Testing experience would strengthen production readiness.",
    },
  ],
  grammar: [],
  formatting: [],
  recommendations: [
    {
      title: "Add metrics",
      description: "Quantify project outcomes and performance wins.",
    },
  ],
};

describe("AI resume parsing", () => {
  it("parses fenced JSON from model output", () => {
    const parsed = parseJsonObject(`\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``);

    expect(resumeAnalysisOutputSchema.parse(parsed).atsScore).toBe(82);
  });

  it("handles malformed AI response by throwing", () => {
    expect(() => parseJsonObject("{not-json")).toThrow(SyntaxError);
  });

  it("rejects missing required fields", () => {
    const missingSummary = { ...validAnalysis, summary: undefined };

    expect(resumeAnalysisOutputSchema.safeParse(missingSummary).success).toBe(false);
  });

  // Gemini sometimes returns recommendation strings; normalize them instead of failing.
  it("normalizes string recommendations into finding objects", () => {
    const result = resumeAnalysisOutputSchema.parse({
      ...validAnalysis,
      recommendations: ["Add measurable achievements."],
    });

    expect(result.recommendations[0]).toMatchObject({
      title: "Add measurable achievements",
      description: "Add measurable achievements.",
    });
  });
});
