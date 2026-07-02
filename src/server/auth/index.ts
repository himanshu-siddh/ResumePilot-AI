import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/features/auth/schemas/auth-schemas";
import { db } from "@/server/db/prisma";
import { verifyPassword } from "@/server/security/password";
import { authConfig } from "./auth.config";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is required in production.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials);

        if (!result.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: result.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            passwordHash: true,
            role: true,
          },
        });

        if (!user?.email || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await verifyPassword(
          result.data.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
