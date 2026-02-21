"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type NavItem = {
  key: string;
  path: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: "overview", path: "/dashboard", exact: true },
  { key: "accounts", path: "/dashboard/accounts" },
  { key: "transactions", path: "/dashboard/transactions" },
  { key: "investments", path: "/dashboard/investments" },
  { key: "budgets", path: "/dashboard/budgets" },
  { key: "reports", path: "/dashboard/reports" },
];

interface DesktopNavProps {
  locale: string;
}

export function DesktopNav({ locale }: DesktopNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  function isActive({ path, exact }: NavItem): boolean {
    const full = `/${locale}${path}`;
    if (exact) return pathname === full;
    return pathname === full || pathname.startsWith(full + "/");
  }

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={`/${locale}${item.path}`}
          className={`transition-colors ${
            isActive(item)
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {t(item.key)}
        </a>
      ))}
    </nav>
  );
}
