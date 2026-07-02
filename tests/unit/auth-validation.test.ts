import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/features/auth/schemas/auth-schemas";

describe("auth validation", () => {
  it("normalizes valid login emails", () => {
    const result = loginSchema.parse({
      email: "USER@Example.COM ",
      password: "secret",
    });

    expect(result.email).toBe("user@example.com");
  });

  it("rejects invalid login input", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  // Password validation protects credential auth before bcrypt work is performed.
  it("rejects weak signup passwords and mismatched confirmation", () => {
    const result = signupSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "password",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined();
  });
});
