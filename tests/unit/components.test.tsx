import { UploadCloud } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "@/components/shared/empty-state";
import { DashboardLoadingSkeleton } from "@/features/dashboard/components/dashboard-loading-skeleton";
import { AnalysisResult } from "@/features/analysis/components/analysis-result";
import { ResumeUploadDropzone } from "@/features/resumes/components/resume-upload-dropzone";

vi.mock("@/lib/uploadthing", () => ({
  UploadButton: ({
    content,
  }: {
    content?: {
      button?: (args: {
        ready: boolean;
        isUploading: boolean;
        files: File[];
      }) => string;
      allowedContent?: () => string;
    };
  }) => (
    <div>
      <button type="button">
        {content?.button?.({ ready: true, isUploading: false, files: [] }) ??
          "Choose PDF"}
      </button>
      <p>{content?.allowedContent?.()}</p>
    </div>
  ),
}));

const failedAnalysis = {
  id: "analysis_1",
  status: "FAILED" as const,
  atsScore: null,
  overallScore: null,
  summary: null,
  errorMessage: "Gemini API key is invalid.",
  model: "gemini-2.5-flash",
  promptVersion: "v1",
  createdAt: new Date("2026-01-02T00:00:00.000Z"),
  resumeVersion: {
    fileName: "resume.pdf",
    fileUrl: "https://example.com/resume.pdf",
    sizeBytes: 1024,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    resume: {
      title: "Resume",
    },
  },
  findings: [],
  missingSkills: [],
};

describe("React components", () => {
  it("renders the upload component without calling UploadThing", () => {
    render(<ResumeUploadDropzone />);

    expect(screen.getByText("Select your resume PDF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose PDF" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Resume upload progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("renders the loading state skeleton", () => {
    const { container } = render(<DashboardLoadingSkeleton />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(5);
  });

  it("renders a failed analysis error state", () => {
    render(<AnalysisResult analysis={failedAnalysis} />);

    expect(screen.getByRole("heading", { name: "Analysis failed" })).toBeInTheDocument();
    expect(screen.getByText("Gemini API key is invalid.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload another resume" })).toHaveAttribute(
      "href",
      "/dashboard/resumes/new",
    );
  });

  it("renders an empty state with an optional action", () => {
    render(
      <EmptyState
        icon={UploadCloud}
        title="No resumes yet"
        description="Upload your first resume to start analysis."
        action={{ href: "/dashboard/resumes/new", label: "Upload resume" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "No resumes yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upload resume" })).toHaveAttribute(
      "href",
      "/dashboard/resumes/new",
    );
  });
});
