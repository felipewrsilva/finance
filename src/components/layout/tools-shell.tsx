import { ToolsNav } from "@/components/layout/tools-nav";

interface Props {
  locale: string;
  children: React.ReactNode;
}

export function ToolsShell({ locale, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <a
          href={`/${locale}`}
          className="text-sm font-semibold tracking-tight text-gray-900"
        >
          Finance
        </a>
        <ToolsNav locale={locale} />
        <span className="hidden w-16 sm:block" aria-hidden />
      </header>
      <main className="mx-auto w-full max-w-screen-lg px-4 py-6 pb-24 sm:px-6 sm:pb-8 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
