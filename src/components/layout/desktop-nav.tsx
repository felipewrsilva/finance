"use client";

import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  /** Match by this prefix instead of href (used when href includes sub-path). */
  activePrefix?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/budgets", label: "Budgets" },
  { href: "/dashboard/reports", label: "Reports" },
  {
    href: "/dashboard/settings/categories",
    label: "Settings",
    activePrefix: "/dashboard/settings",
  },
];

export function DesktopNav() {
  const pathname = usePathname();

  function isActive({ href, exact, activePrefix }: NavItem): boolean {
    const target = activePrefix ?? href;
    if (exact) return pathname === href;
    return pathname === target || pathname.startsWith(target + "/");
  }

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`transition-colors ${
            isActive(item)
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
