import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-5 h-10 w-full max-w-xl" />
            <Skeleton className="mt-3 h-10 w-full max-w-lg" />
            <Skeleton className="mt-6 h-11 w-40" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-3 h-9 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <Skeleton className="mt-4 h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mx-auto h-44 w-44 rounded-full" />
            <Skeleton className="mt-6 h-10 w-full" />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
