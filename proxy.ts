export { auth as proxy } from "@/server/auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};
