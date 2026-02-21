function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />
  );
}

export default function AccountsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Balance hero */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Account cards */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
