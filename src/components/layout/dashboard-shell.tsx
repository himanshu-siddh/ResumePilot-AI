"use client";

import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Settings,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type DashboardShellProps = {
  user: DashboardUser;
  children: React.ReactNode;
};

const navigationItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Resumes", href: "/dashboard/resumes", icon: FileText },
  { label: "AI Analysis", href: "/dashboard/analysis", icon: BarChart3 },
  { label: "Resume Chat", href: "/dashboard/chat", icon: MessageSquareText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
              isActive &&
                "bg-zinc-950 text-white shadow-sm hover:bg-zinc-950 hover:text-white dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 dark:hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm dark:bg-zinc-900 dark:text-white">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight">
            ResumePilot AI
          </span>
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">
            Resume Intelligence
          </span>
        </span>
      </Link>

      <div className="mt-8">
        <Button className="w-full justify-start" asChild>
          <Link href="/dashboard/resumes/new">
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Quick upload
          </Link>
        </Button>
      </div>

      <div className="mt-8 flex-1">
        <SidebarNavigation />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium">AI review credits</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          8 analyses remaining this month.
        </p>
        <div className="mt-3 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-2 w-2/3 rounded-full bg-zinc-950 dark:bg-zinc-50" />
        </div>
      </div>
    </div>
  );
}

function ProfileMenu({ user }: { user: DashboardUser }) {
  const initials = getInitials(user.name, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-11 gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt="" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-36 truncate text-left text-sm sm:block">
            {user.name || user.email || "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="block text-sm">{user.name || "ResumePilot user"}</span>
          <span className="block truncate text-xs font-normal text-zinc-500 dark:text-zinc-400">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Profile settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Dark mode ready
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-950 focus:shadow dark:focus:bg-zinc-900 dark:focus:text-zinc-50"
      >
        Skip to main content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 xl:block">
        <SidebarContent />
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="xl:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="sr-only">
                    <SheetTitle>Dashboard navigation</SheetTitle>
                    <SheetDescription>
                      Access ResumePilot AI dashboard sections.
                    </SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Dashboard
                </p>
                <p className="text-lg font-semibold tracking-tight">
                  Resume command center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button className="hidden sm:inline-flex" asChild>
                <Link href="/dashboard/resumes/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Upload resume
                </Link>
              </Button>
              <ProfileMenu user={user} />
            </div>
          </div>
        </header>

        <main id="dashboard-main" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
