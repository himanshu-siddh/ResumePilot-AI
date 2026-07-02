export const RESUME_CHAT_PROMPT_VERSION = "resume-chat-v1";

type ChatRole = "USER" | "ASSISTANT";

type PromptMessage = {
  role: ChatRole;
  content: string;
};

export function buildResumeChatPrompt({
  resumeTitle,
  resumeText,
  recentMessages,
  userQuestion,
}: {
  resumeTitle: string;
  resumeText: string;
  recentMessages: PromptMessage[];
  userQuestion: string;
}) {
  const conversation = recentMessages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return `You are ResumePilot AI, an assistant that answers questions only about one uploaded resume.

Resume title: ${resumeTitle}

Rules:
- Answer only using the resume text below and the recent conversation.
- If the user asks about something not present in the resume, say: "That information is not available in this resume."
- Do not invent experience, skills, education, metrics, dates, companies, certifications, or achievements.
- Do not answer general career questions unless the answer can be grounded in this resume.
- Be concise, specific, and practical.
- If recommending improvements, clearly label them as recommendations, not facts.

Resume text:
"""
${resumeText}
"""

Recent conversation:
"""
${conversation || "No prior messages."}
"""

User question:
"""
${userQuestion}
"""`;
}
