import { SemeiaMark } from "@/components/brand/semeia-mark";
import { ToolsNav } from "@/components/layout/tools-nav";
import { BRAND } from "@/lib/brand";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export function ToolsShell({ children }: Props) {
  return (
    <div className="min-h-dvh text-[var(--text)]">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-[var(--primary)]">
          <SemeiaMark className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
          <span className="font-display truncate text-xl tracking-tight text-[var(--text)] sm:text-2xl">
            {BRAND.name}
          </span>
        </Link>
        <ToolsNav />
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
