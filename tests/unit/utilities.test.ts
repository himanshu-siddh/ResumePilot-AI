import { describe, expect, it } from "vitest";

import { formatBytes, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getScoreBand } from "../helpers/score";

describe("utility functions", () => {
  it("formats file sizes for resume metadata", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });

  it("formats dates consistently for dashboard rows", () => {
    expect(formatDate(new Date("2026-01-02T00:00:00.000Z"))).toBe("Jan 2, 2026");
  });

  it("merges tailwind classes predictably", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("calculates score bands for UI messaging", () => {
    expect(getScoreBand(90)).toBe("strong");
    expect(getScoreBand(70)).toBe("moderate");
    expect(getScoreBand(40)).toBe("needs-work");
    expect(getScoreBand(null)).toBe("unknown");
  });
});
