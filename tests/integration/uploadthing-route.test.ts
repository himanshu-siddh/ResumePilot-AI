import { beforeEach, describe, expect, it, vi } from "vitest";

type UploadFile = {
  name: string;
  key: string;
  ufsUrl: string;
  type: string;
  size: number;
  fileHash: string;
};

type MiddlewareArgs = {
  files: UploadFile[];
};

type CompletionArgs = {
  metadata: {
    userId: string;
  };
  file: UploadFile;
};

type EndpointMock = {
  middleware: (callback: (args: MiddlewareArgs) => Promise<{ userId: string }>) => EndpointMock;
  onUploadComplete: (
    callback: (args: CompletionArgs) => Promise<Record<string, unknown>>,
  ) => EndpointMock;
  runMiddleware: (args: MiddlewareArgs) => Promise<{ userId: string }>;
  runComplete: (args: CompletionArgs) => Promise<Record<string, unknown>>;
};

const authMock = vi.fn();
const createResumeFromUploadMock = vi.fn();
const runResumeAnalysisMock = vi.fn();
const revalidatePathMock = vi.fn();

function createEndpointMock(): EndpointMock {
  let middlewareCallback: ((args: MiddlewareArgs) => Promise<{ userId: string }>) | null =
    null;
  let completionCallback:
    | ((args: CompletionArgs) => Promise<Record<string, unknown>>)
    | null = null;

  const endpoint: EndpointMock = {
    middleware(callback) {
      middlewareCallback = callback;
      return endpoint;
    },
    onUploadComplete(callback) {
      completionCallback = callback;
      return endpoint;
    },
    runMiddleware(args) {
      if (!middlewareCallback) {
        throw new Error("middleware callback was not registered");
      }

      return middlewareCallback(args);
    },
    runComplete(args) {
      if (!completionCallback) {
        throw new Error("completion callback was not registered");
      }

      return completionCallback(args);
    },
  };

  return endpoint;
}

vi.mock("uploadthing/next", () => ({
  createRouteHandler: vi.fn(() => ({
    GET: vi.fn(),
    POST: vi.fn(),
  })),
  createUploadthing: vi.fn(() => () => createEndpointMock()),
}));

vi.mock("uploadthing/server", () => ({
  UploadThingError: class UploadThingError extends Error {
    readonly code: string;

    constructor({ code, message }: { code: string; message: string }) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/server/auth/middleware", () => ({
  auth: authMock,
}));

vi.mock("@/features/resumes/services/resume-service", () => ({
  createResumeFromUpload: createResumeFromUploadMock,
}));

vi.mock("@/features/analysis/services/resume-analysis-service", () => ({
  runResumeAnalysis: runResumeAnalysisMock,
}));

const pdfFile: UploadFile = {
  name: "resume.pdf",
  key: "file_key",
  ufsUrl: "https://uploadthing.example/resume.pdf",
  type: "application/pdf",
  size: 1024,
  fileHash: "hash",
};

async function loadEndpoint() {
  vi.resetModules();
  const { uploadRouter } = await import("@/server/upload/uploadthing");
  return uploadRouter.resumeUploader as unknown as EndpointMock;
}

describe("UploadThing API route", () => {
  beforeEach(() => {
    authMock.mockReset();
    createResumeFromUploadMock.mockReset();
    runResumeAnalysisMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rejects unauthorized upload requests", async () => {
    authMock.mockResolvedValue(null);
    const endpoint = await loadEndpoint();

    await expect(endpoint.runMiddleware({ files: [pdfFile] })).rejects.toThrow(
      "You must be signed in to upload a resume.",
    );
  });

  it("rejects invalid upload requests", async () => {
    authMock.mockResolvedValue({ user: { id: "user_1" } });
    const endpoint = await loadEndpoint();

    await expect(
      endpoint.runMiddleware({
        files: [{ ...pdfFile, type: "image/png" }],
      }),
    ).rejects.toThrow("Only PDF resumes are supported.");
  });

  it("returns server data for a successful upload", async () => {
    authMock.mockResolvedValue({ user: { id: "user_1" } });
    createResumeFromUploadMock.mockResolvedValue({
      id: "resume_1",
      title: "resume",
      versions: [
        {
          id: "version_1",
          fileUrl: pdfFile.ufsUrl,
        },
      ],
    });
    runResumeAnalysisMock.mockResolvedValue({
      analysisId: "analysis_1",
      status: "COMPLETED",
    });
    const endpoint = await loadEndpoint();

    const metadata = await endpoint.runMiddleware({ files: [pdfFile] });
    const response = await endpoint.runComplete({
      metadata,
      file: pdfFile,
    });

    expect(response).toMatchObject({
      resumeId: "resume_1",
      resumeVersionId: "version_1",
      analysisId: "analysis_1",
      analysisStatus: "COMPLETED",
      status: "READY",
    });
    expect(createResumeFromUploadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        fileName: "resume.pdf",
      }),
    );
  });

  it("handles server completion errors", async () => {
    authMock.mockResolvedValue({ user: { id: "user_1" } });
    createResumeFromUploadMock.mockResolvedValue({
      id: "resume_1",
      title: "resume",
      versions: [],
    });
    const endpoint = await loadEndpoint();

    await expect(
      endpoint.runComplete({
        metadata: { userId: "user_1" },
        file: pdfFile,
      }),
    ).rejects.toThrow("Resume metadata could not be saved.");
  });
});
