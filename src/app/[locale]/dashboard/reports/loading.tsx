function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />
  );
}

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-2"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-50 px-4 py-3">
          <Skeleton className="h-4 w-36" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0"
          >
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
