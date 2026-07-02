import type { NextAuthConfig } from "next-auth";

import {
  userRoles,
  type UserRole,
} from "@/features/auth/types/user-role";

function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" && userRoles.includes(value as UserRole)
  );
}

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAuthenticated = Boolean(auth?.user);
      const isAuthPage = pathname === "/signin" || pathname === "/signup";

      if (pathname.startsWith("/dashboard")) {
        return isAuthenticated;
      }

      if (isAuthenticated && isAuthPage) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (
        session.user &&
        typeof token.id === "string" &&
        isUserRole(token.role)
      ) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    },
  },
  trustHost:
    process.env.NODE_ENV === "development" ||
    process.env.AUTH_TRUST_HOST === "true",
} satisfies NextAuthConfig;
