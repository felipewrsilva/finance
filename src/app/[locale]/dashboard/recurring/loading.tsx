function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />
  );
}

export default function RecurringLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="text-right space-y-1.5 shrink-0">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-50 pt-3">
              <Skeleton className="h-7 w-12 rounded-lg" />
              <Skeleton className="h-7 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
