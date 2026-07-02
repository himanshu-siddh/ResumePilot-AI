import { GoogleGenAI } from "@google/genai";

let cachedGeminiClient: GoogleGenAI | null = null;

export const GEMINI_RESUME_ANALYSIS_MODEL =
  process.env.GEMINI_RESUME_ANALYSIS_MODEL ?? "gemini-2.0-flash";

export const GEMINI_RESUME_CHAT_MODEL =
  process.env.GEMINI_RESUME_CHAT_MODEL ?? "gemini-2.0-flash";

export function getGeminiClient() {
  if (cachedGeminiClient) {
    return cachedGeminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required to analyze resumes.");
  }

  cachedGeminiClient = new GoogleGenAI({
    apiKey,
  });

  return cachedGeminiClient;
}
