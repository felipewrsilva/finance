"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const NAV_ITEMS: { key: string; path: string }[] = [
  { key: "redirect", path: "/ferramentas/redirecionar" },
  { key: "allocation", path: "/ferramentas/alocacao" },
  { key: "projection", path: "/ferramentas/projecao" },
];

export function ToolsNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <>
      <nav className="hidden items-center gap-5 text-sm text-[var(--text-secondary)] md:flex">
        {NAV_ITEMS.map(({ key, path }) => {
          const href = `/${locale}${path}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <a
              key={key}
              href={href}
              className={`border-b border-transparent pb-0.5 transition-colors ${
                active
                  ? "border-[var(--primary)] text-[var(--text)]"
                  : "hover:text-[var(--text)]"
              }`}
            >
              {t(key)}
            </a>
          );
        })}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--background)]/95 pt-1 backdrop-blur-sm md:hidden pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl">
          {NAV_ITEMS.map(({ key, path }) => {
            const href = `/${locale}${path}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <a
                key={key}
                href={href}
                className={`flex min-h-12 flex-1 items-center justify-center px-1 text-center text-[11px] leading-tight ${
                  active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                }`}
              >
                {t(key)}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
