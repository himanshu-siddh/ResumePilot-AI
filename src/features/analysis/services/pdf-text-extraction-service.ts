import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

import {
  RESUME_UPLOAD_MAX_BYTES,
  RESUME_UPLOAD_MIME_TYPE,
} from "@/features/resumes/constants/upload-limits";

const PDF_FETCH_TIMEOUT_MS = 15_000;
const PDF_EXTRACTION_MAX_ATTEMPTS = 3;
const PDF_EXTRACTION_RETRY_DELAY_MS = 1_500;
const MIN_EXTRACTED_TEXT_LENGTH = 80;
const ALLOWED_PDF_HOST_SUFFIXES = [".ufs.sh", "ufs.sh", "utfs.io"];

type PdfParseResult = {
  text: string;
};

type PdfParseInstance = {
  getText(): Promise<PdfParseResult>;
  destroy(): Promise<void>;
};

type PdfParseConstructor = {
  new (options: { data: Uint8Array }): PdfParseInstance;
  setWorker(workerSrc?: string): string;
};

const runtimeRequire = createRequire(`${process.cwd()}/package.json`);
let cachedPdfParse: PdfParseConstructor | null = null;

function getPdfParse() {
  if (cachedPdfParse) {
    return cachedPdfParse;
  }

  const pdfParseModule = runtimeRequire("pdf-parse") as {
    PDFParse: PdfParseConstructor;
  };
  const workerPath = runtimeRequire.resolve(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
  );

  pdfParseModule.PDFParse.setWorker(pathToFileURL(workerPath).href);
  cachedPdfParse = pdfParseModule.PDFParse;

  return cachedPdfParse;
}

export class PdfTextExtractionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PdfTextExtractionError";
  }
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function assertAllowedPdfUrl(fileUrl: string) {
  let url: URL;

  try {
    url = new URL(fileUrl);
  } catch {
    throw new PdfTextExtractionError("Uploaded PDF URL is invalid.");
  }

  if (url.protocol !== "https:") {
    throw new PdfTextExtractionError("Uploaded PDF URL must use HTTPS.");
  }

  const isAllowedHost = ALLOWED_PDF_HOST_SUFFIXES.some((host) =>
    host.startsWith(".")
      ? url.hostname.endsWith(host)
      : url.hostname === host || url.hostname.endsWith(`.${host}`),
  );

  if (!isAllowedHost) {
    throw new PdfTextExtractionError("Uploaded PDF URL host is not allowed.");
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function extractPdfTextOnce(fileUrl: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PDF_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(fileUrl, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new PdfTextExtractionError("Could not download the uploaded PDF.");
    }

    const contentType = response.headers.get("content-type");

    if (contentType && !contentType.includes(RESUME_UPLOAD_MIME_TYPE)) {
      throw new PdfTextExtractionError("Uploaded file is not a PDF.");
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && Number(contentLength) > RESUME_UPLOAD_MAX_BYTES) {
      throw new PdfTextExtractionError("PDF exceeds the 5MB processing limit.");
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength > RESUME_UPLOAD_MAX_BYTES) {
      throw new PdfTextExtractionError("PDF exceeds the 5MB processing limit.");
    }

    const PDFParse = getPdfParse();
    const parser = new PDFParse({
      data: new Uint8Array(arrayBuffer),
    });

    try {
      const result = await parser.getText();
      const text = normalizeExtractedText(result.text);

      if (text.length < MIN_EXTRACTED_TEXT_LENGTH) {
        throw new PdfTextExtractionError(
          "The PDF text could not be extracted clearly enough for analysis.",
        );
      }

      return text;
    } finally {
      await parser.destroy();
    }
  } catch (error) {
    if (error instanceof PdfTextExtractionError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new PdfTextExtractionError("PDF download timed out.");
    }

    throw new PdfTextExtractionError("PDF text extraction failed.", {
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractPdfTextFromUrl(fileUrl: string) {
  assertAllowedPdfUrl(fileUrl);

  let lastError: PdfTextExtractionError | null = null;

  for (let attempt = 1; attempt <= PDF_EXTRACTION_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await extractPdfTextOnce(fileUrl);
    } catch (error) {
      if (!(error instanceof PdfTextExtractionError)) {
        throw error;
      }

      lastError = error;

      if (attempt < PDF_EXTRACTION_MAX_ATTEMPTS) {
        await delay(PDF_EXTRACTION_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new PdfTextExtractionError("PDF text extraction failed.");
}
