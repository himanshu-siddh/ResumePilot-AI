"use server";

import { AuthError } from "next-auth";

import { loginSchema, signupSchema } from "@/features/auth/schemas/auth-schemas";
import { db } from "@/server/db/prisma";
import { signIn, signOut } from "@/server/auth";
import { hashPassword } from "@/server/security/password";
import { readFormString } from "@/lib/form-data";

type AuthField = "name" | "email" | "password" | "confirmPassword";

export type AuthActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string[]>>;
};

const invalidCredentialsMessage = "Invalid email or password.";

function isRedirectError(error: unknown): error is { digest: string } {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }

  const digest = (error as { digest?: unknown }).digest;

  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

function isUniqueConstraintError(error: unknown): error is { code: "P2002" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: readFormString(formData, "name"),
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    confirmPassword: readFormString(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingUser = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      status: "error",
      message: "An account with this email already exists.",
      fieldErrors: {
        email: ["Use a different email or sign in instead."],
      },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "An account with this email already exists.",
        fieldErrors: {
          email: ["Use a different email or sign in instead."],
        },
      };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Account created, but automatic sign in failed.",
      };
    }

    throw error;
  }

  return { status: "idle" };
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AuthError) {
      return {
        status: "error",
        message: invalidCredentialsMessage,
      };
    }

    throw error;
  }

  return { status: "idle" };
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
