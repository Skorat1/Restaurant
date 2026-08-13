import { Skeleton, OrdersListSkeleton } from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-8" aria-busy="true" aria-label="Loading orders...">
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64" />
      </div>

      <OrdersListSkeleton count={4} />
    </div>
  );
}
