import { z } from "zod";

const scoreSchema = z.number().int().min(0).max(100);

const severitySchema = z.enum(["low", "medium", "high"]);

function createTitleFromText(text: string) {
  const [firstSentence] = text.split(/[.!?]/);
  const title = (firstSentence || text).trim();

  return title.length > 120 ? `${title.slice(0, 117)}...` : title;
}

const findingSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  severity: severitySchema.optional(),
  beforeText: z.string().trim().max(500).optional(),
  afterText: z.string().trim().max(500).optional(),
});

const flexibleFindingSchema = z.union([
  findingSchema,
  z.string().trim().min(1).max(600).transform((description) => ({
    title: createTitleFromText(description),
    description,
    severity: undefined,
    beforeText: undefined,
    afterText: undefined,
  })),
]);

const missingSkillSchema = z.object({
  skill: z.string().trim().min(1).max(80),
  importance: severitySchema,
  reason: z.string().trim().min(1).max(500),
});

export const resumeAnalysisOutputSchema = z.object({
  atsScore: scoreSchema,
  overallScore: scoreSchema,
  summary: z.string().trim().min(1).max(1000),
  strengths: z.array(flexibleFindingSchema).max(6),
  weaknesses: z.array(flexibleFindingSchema).max(6),
  missingSkills: z.array(missingSkillSchema).max(10),
  grammar: z.array(flexibleFindingSchema).max(8),
  formatting: z.array(flexibleFindingSchema).max(8),
  recommendations: z.array(flexibleFindingSchema).max(10),
});

export type ResumeAnalysisOutput = z.infer<typeof resumeAnalysisOutputSchema>;
