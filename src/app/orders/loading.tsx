import { Skeleton } from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-8" aria-busy="true" aria-label="Loading orders...">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-neutral-800/80 bg-neutral-900/60 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800/60 pb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
