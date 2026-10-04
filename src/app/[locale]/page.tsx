import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function ToolsHome({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("tools");

  return (
    <div className="pt-2 sm:pt-10">
      <h1 className="max-w-xl font-display text-[1.85rem] leading-[1.2] text-[var(--text)] sm:text-4xl md:text-5xl">
        {t("homeTitle")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
        {t("homeSubtitle")}
      </p>

      <ol className="mt-10 space-y-8 border-t border-[var(--border)] pt-8 sm:mt-16 sm:space-y-12 sm:pt-12">
        <li>
          <a href={`/${locale}/ferramentas/redirecionar`} className="group block py-1">
            <p className="text-sm text-[var(--primary)]">{t("homeOneIndex")}</p>
            <h2 className="mt-1 font-display text-[1.45rem] leading-snug group-hover:text-[var(--primary)] sm:mt-2 sm:text-3xl">
              {t("redirectTitle")}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-3 sm:text-base">
              {t("homeOneAsk")}
            </p>
          </a>
        </li>
        <li>
          <a href={`/${locale}/ferramentas/alocacao`} className="group block py-1">
            <p className="text-sm text-[var(--text-muted)]">{t("homeTwoIndex")}</p>
            <h2 className="mt-1 font-display text-xl leading-snug group-hover:text-[var(--primary)] sm:mt-2 sm:text-2xl">
              {t("allocationTitle")}
            </h2>
          </a>
        </li>
        <li>
          <a href={`/${locale}/ferramentas/projecao`} className="group block py-1">
            <p className="text-sm text-[var(--text-muted)]">{t("homeThreeIndex")}</p>
            <h2 className="mt-1 font-display text-xl leading-snug group-hover:text-[var(--primary)] sm:mt-2 sm:text-2xl">
              {t("projectionTitle")}
            </h2>
          </a>
        </li>
      </ol>
    </div>
  );
}
