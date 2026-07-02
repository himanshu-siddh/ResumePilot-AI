import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Basic account information. Profile editing and billing controls should
          be added before this ships.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Read-only account details from the current Auth.js session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">Name</p>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {user.name ?? "Not set"}
            </p>
          </div>
          <div>
            <p className="font-medium">Email</p>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {user.email ?? "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
