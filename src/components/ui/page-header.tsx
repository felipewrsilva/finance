import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional slot rendered flush-right (e.g. action button). */
  action?: ReactNode;
}

/**
 * Consistent page header.
 * Renders title + optional subtitle on the left and an optional action on the right.
 * Typography scales from text-2xl (mobile) to text-3xl (sm+).
 */
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
