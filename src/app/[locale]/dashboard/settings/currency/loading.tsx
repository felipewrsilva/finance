function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-100 ${className ?? ""}`} />
  );
}

export default function CurrencySettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0"
          >
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
        <div className="px-4 py-3">
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
