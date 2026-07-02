import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const redirectMock = vi.fn((path: string): never => {
  throw new Error(`redirect:${path}`);
});

vi.mock("@/server/auth", () => ({
  auth: authMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("auth boundary", () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  it("redirects unauthorized users to signin", async () => {
    authMock.mockResolvedValue(null);
    const { requireUser } = await import("@/server/auth/session");

    await expect(requireUser()).rejects.toThrow("redirect:/signin");
    expect(redirectMock).toHaveBeenCalledWith("/signin");
  });

  it("returns the current user when session exists", async () => {
    const user = { id: "user_1", email: "test@example.com", name: "Test User" };
    authMock.mockResolvedValue({ user });
    const { requireUser } = await import("@/server/auth/session");

    await expect(requireUser()).resolves.toEqual(user);
  });
});
