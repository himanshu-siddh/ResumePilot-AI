import { getCurrentUser } from "@/server/auth/session";

export async function getAuthenticatedUserId() {
  const user = await getCurrentUser();

  return user?.id ?? null;
}
