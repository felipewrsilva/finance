import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function ToolsHome({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("tools");

  const cards = [
    {
      href: `/${locale}/ferramentas/projecao`,
      title: t("projectionTitle"),
      body: t("projectionBlurb"),
    },
    {
      href: `/${locale}/ferramentas/alocacao`,
      title: t("allocationTitle"),
      body: t("allocationBlurb"),
    },
    {
      href: `/${locale}/ferramentas/redirecionar`,
      title: t("redirectTitle"),
      body: t("redirectBlurb"),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          {t("homeTitle")}
        </h1>
        <p className="max-w-2xl text-base text-gray-500">{t("homeSubtitle")}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
          >
            <h2 className="text-base font-semibold text-gray-900">{card.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{card.body}</p>
            <p className="mt-4 text-sm font-semibold text-indigo-600">{t("openTool")}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
