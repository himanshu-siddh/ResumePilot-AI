import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: ["./tests/setup.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/components/shared/empty-state.tsx",
        "src/components/ui/{button,card,skeleton}.tsx",
        "src/features/analysis/components/analysis-result.tsx",
        "src/features/analysis/schemas/analysis-output-schema.ts",
        "src/features/analysis/services/resume-analysis-service.ts",
        "src/features/analysis/utils/json.ts",
        "src/features/auth/schemas/auth-schemas.ts",
        "src/features/dashboard/components/dashboard-loading-skeleton.tsx",
        "src/features/resumes/components/resume-upload-dropzone.tsx",
        "src/features/resumes/constants/upload-limits.ts",
        "src/features/resumes/schemas/resume-schemas.ts",
        "src/lib/{format,utils}.ts",
        "src/server/auth/session.ts",
        "src/server/upload/uploadthing.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": "/home/developer/resumepilot-ai/src",
    },
  },
});
