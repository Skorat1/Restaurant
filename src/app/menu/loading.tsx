import { Skeleton, MenuGridSkeleton } from "@/components/Skeleton";

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
      <MenuGridSkeleton count={6} />
    </div>
  );
}
