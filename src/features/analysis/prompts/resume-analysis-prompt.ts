export const RESUME_ANALYSIS_PROMPT_VERSION = "resume-analysis-v1";

export const resumeAnalysisJsonSchema = {
  type: "object",
  required: [
    "atsScore",
    "overallScore",
    "summary",
    "strengths",
    "weaknesses",
    "missingSkills",
    "grammar",
    "formatting",
    "recommendations",
  ],
  properties: {
    atsScore: {
      type: "integer",
    },
    overallScore: {
      type: "integer",
    },
    summary: {
      type: "string",
    },
    strengths: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          beforeText: { type: "string" },
          afterText: { type: "string" },
        },
      },
    },
    weaknesses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          beforeText: { type: "string" },
          afterText: { type: "string" },
        },
      },
    },
    missingSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          importance: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
    grammar: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          beforeText: { type: "string" },
          afterText: { type: "string" },
        },
      },
    },
    formatting: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          beforeText: { type: "string" },
          afterText: { type: "string" },
        },
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string" },
          beforeText: { type: "string" },
          afterText: { type: "string" },
        },
      },
    },
  },
} as const;

export function buildResumeAnalysisPrompt(resumeText: string) {
  return `You are ResumePilot AI, a senior technical recruiter and ATS optimization expert.

Analyze the resume text below for applicant tracking systems, clarity, grammar, formatting, skills, and practical hiring impact.

Return only valid JSON. Do not wrap the response in markdown. Do not include commentary outside the JSON object.

Rules:
- Use the exact top-level keys required by the schema.
- Use integer scores from 0 to 100 for atsScore and overallScore.
- Use only "low", "medium", or "high" for severity and importance.
- Return at most 6 strengths, 6 weaknesses, 10 missingSkills, 8 grammar items, 8 formatting items, and 10 recommendations.
- Every finding item must include title and description.
- Every missing skill must include skill, importance, and reason.
- Use concise but specific language.
- For missing data, return an empty array instead of omitting a key.
- For grammar items, include beforeText and afterText when a specific rewrite is possible.
- For formatting items, focus on structure, section order, bullets, length, and scanability.
- For recommendations, prioritize changes that improve ATS matching and recruiter readability.
- Do not invent employment history, education, certifications, or metrics that are not implied by the resume.
- If the resume text is sparse or badly extracted, say so in summary and lower the relevant scores.

Resume text:
"""
${resumeText}
"""`;
}
