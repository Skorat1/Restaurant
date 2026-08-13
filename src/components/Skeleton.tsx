export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-neutral-800/60 ${className}`} aria-hidden="true" />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-3" aria-busy="true" aria-label="Loading...">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="rounded-[2rem] border border-neutral-800/90 bg-neutral-950/95 overflow-hidden p-0 shadow-xl space-y-4" aria-busy="true" aria-label="Loading dish...">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-52 rounded-none bg-neutral-800/80" />
      <div className="p-6 pt-2 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4" aria-busy="true" aria-label="Loading order details...">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      {/* Item thumbnails skeleton strip */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr aria-busy="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
