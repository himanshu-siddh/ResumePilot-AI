import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
        {action ? (
          <Button asChild className="mt-6">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
