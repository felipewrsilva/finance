"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const NAV_ITEMS: { key: string; path: string; exact?: boolean }[] = [
  { key: "home", path: "", exact: true },
  { key: "projection", path: "/ferramentas/projecao" },
  { key: "allocation", path: "/ferramentas/alocacao" },
  { key: "redirect", path: "/ferramentas/redirecionar" },
];

interface Props {
  locale: string;
}

export function ToolsNav({ locale }: Props) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  function isActive(path: string, exact?: boolean) {
    const full = path ? `/${locale}${path}` : `/${locale}`;
    if (exact) return pathname === full || pathname === `${full}/`;
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  return (
    <>
      <nav className="hidden items-center gap-5 text-sm font-medium sm:flex">
        {NAV_ITEMS.map(({ key, path, exact }) => {
          const active = isActive(path, exact);
          const href = path ? `/${locale}${path}` : `/${locale}`;
          return (
            <a
              key={key}
              href={href}
              className={`transition-colors ${
                active ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {t(key)}
            </a>
          );
        })}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-gray-200 bg-white sm:hidden">
        {NAV_ITEMS.map(({ key, path, exact }) => {
          const active = isActive(path, exact);
          const href = path ? `/${locale}${path}` : `/${locale}`;
          return (
            <a
              key={key}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[9px] font-medium transition-colors ${
                active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="truncate">{t(key)}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
