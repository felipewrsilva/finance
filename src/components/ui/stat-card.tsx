interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  valueClassName?: string;
}

/**
 * Responsive stat card for financial values.
 *
 * Mobile  → horizontal row: label left, value right.
 * sm+     → vertical card: label top, value below.
 *
 * This prevents currency values from truncating in tight 3-column grids
 * on small screens (320–375 px).
 */
export function StatCard({
  label,
  value,
  subtext,
  valueClassName = "",
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm sm:block sm:p-5">
      <p className="text-sm font-medium text-gray-500 sm:text-xs sm:uppercase sm:tracking-wider sm:text-gray-400">
        {label}
      </p>
      <div className="text-right sm:text-left">
        <p
          className={[
            "text-base font-semibold tabular-nums tracking-tight sm:mt-2 sm:text-xl",
            valueClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
