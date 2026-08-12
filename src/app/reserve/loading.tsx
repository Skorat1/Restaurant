import { Skeleton } from "@/components/Skeleton";

export default function ReserveLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-10" aria-busy="true" aria-label="Loading reservation form...">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-10 w-2/3 max-w-md" />
        <Skeleton className="mx-auto h-4 w-1/2" />
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
