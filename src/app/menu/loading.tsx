import { Skeleton } from "@/components/Skeleton";

export default function MenuLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 space-y-10" aria-busy="true" aria-label="Loading menu...">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-10 w-3/4 max-w-md" />
        <Skeleton className="mx-auto h-4 w-1/2 max-w-sm" />
      </div>

      {/* Category tabs skeleton */}
      <div className="flex justify-center gap-3 overflow-x-auto py-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Menu grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-neutral-800/80 bg-neutral-900/60 p-5 space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
