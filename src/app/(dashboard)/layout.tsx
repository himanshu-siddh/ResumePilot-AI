import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/server/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
      }}
    >
      {children}
    </DashboardShell>
  );
}
