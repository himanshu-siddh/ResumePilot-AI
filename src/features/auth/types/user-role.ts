export const userRoles = ["USER", "ADMIN"] as const;

export type UserRole = (typeof userRoles)[number];
