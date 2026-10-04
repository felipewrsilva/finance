"use client";

import { usePathname } from "next/navigation";
import { nav } from "@/lib/copy";

const NAV_ITEMS: { key: "redirect" | "allocation" | "projection" | "mix" | "comparar" | "folga"; path: string }[] = [
  { key: "redirect", path: "/ferramentas/redirecionar" },
  { key: "allocation", path: "/ferramentas/alocacao" },
  { key: "projection", path: "/ferramentas/projecao" },
  { key: "mix", path: "/ferramentas/mix" },
  { key: "comparar", path: "/ferramentas/comparar" },
  { key: "folga", path: "/ferramentas/folga" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ToolsNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-3 text-sm text-[var(--text-secondary)] md:flex">
        {NAV_ITEMS.map(({ key, path }) => {
          const active = isActive(pathname, path);
          return (
            <a
              key={key}
              href={path}
              className={`border-b border-transparent pb-0.5 transition-colors ${
                active ? "border-[var(--primary)] text-[var(--text)]" : "hover:text-[var(--text)]"
              }`}
            >
              {nav[key]}
            </a>
          );
        })}
      </nav>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--border)] bg-[var(--background)]/95 pt-1 backdrop-blur-sm md:hidden pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-3xl">
          {NAV_ITEMS.map(({ key, path }) => {
            const active = isActive(pathname, path);
            return (
              <a
                key={key}
                href={path}
                className={`flex min-h-12 flex-1 items-center justify-center px-0.5 text-center text-[10px] leading-tight sm:text-[11px] ${
                  active ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                }`}
              >
                {nav[key]}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
