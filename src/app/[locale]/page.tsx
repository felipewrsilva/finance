import { getTranslations } from "next-intl/server";
import { ContentStill, PhotoCredit } from "@/components/home/credited-photo";
import { YoutubeClip } from "@/components/home/youtube-clip";
import { STILLS } from "@/lib/stills";

type Props = { params: Promise<{ locale: string }> };

const PHOTO_SIZES = "(max-width: 768px) 100vw, 768px";

export default async function ToolsHome({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("tools");

  const cards = [
    {
      href: `/${locale}/ferramentas/redirecionar`,
      index: t("homeOneIndex"),
      title: t("redirectTitle"),
      ask: t("homeOneAsk"),
      still: STILLS.spend,
      alt: t("homeOnePhotoAlt"),
      credit: t("homeOnePhotoCredit"),
      accent: true,
    },
    {
      href: `/${locale}/ferramentas/alocacao`,
      index: t("homeTwoIndex"),
      title: t("allocationTitle"),
      ask: t("homeTwoAsk"),
      still: STILLS.income,
      alt: t("homeTwoPhotoAlt"),
      credit: t("homeTwoPhotoCredit"),
      accent: false,
    },
    {
      href: `/${locale}/ferramentas/projecao`,
      index: t("homeThreeIndex"),
      title: t("projectionTitle"),
      ask: t("homeThreeAsk"),
      still: STILLS.time,
      alt: t("homeThreePhotoAlt"),
      credit: t("homeThreePhotoCredit"),
      accent: false,
    },
  ];

  return (
    <div className="pt-2 sm:pt-10">
      <h1 className="max-w-xl font-display text-[1.85rem] leading-[1.2] text-[var(--text)] sm:text-4xl md:text-5xl">
        {t("homeTitle")}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
        {t("homeSubtitle")}
      </p>

      <ol className="mt-10 space-y-10 sm:mt-14 sm:space-y-14">
        {cards.map((card) => (
          <li key={card.href}>
            <figure>
              <a href={card.href} className="group block">
                <div className="relative">
                  <ContentStill
                    src={card.still.src}
                    alt={card.alt}
                    sizes={PHOTO_SIZES}
                    imageClassName="h-52 w-full object-cover sm:h-64"
                    priority={card.accent}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--surface-elevated)]/95 px-2.5 py-1 text-xs tracking-wide text-[var(--text)] shadow-[var(--elevation-sm)]">
                    {card.index}
                  </span>
                </div>
                <h2
                  className={`mt-4 font-display leading-snug group-hover:text-[var(--primary)] ${
                    card.accent ? "text-[1.45rem] sm:text-3xl" : "text-xl sm:text-2xl"
                  }`}
                >
                  {card.title}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                  {card.ask}
                </p>
              </a>
              <PhotoCredit href={card.still.href}>{card.credit}</PhotoCredit>
            </figure>
          </li>
        ))}
      </ol>

      <section className="mt-14 border-t border-[var(--border)] pt-10 sm:mt-16">
        <div className="mb-6 max-w-md">
          <h2 className="font-display text-2xl leading-snug text-[var(--text)] sm:text-3xl">
            {t("homeVideosTitle")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {t("homeVideosLead")}
          </p>
        </div>
        <YoutubeClip
          videoId="WBNkhIaY7gc"
          title={t("homeVideoSelicTitle")}
          source={t("homeVideoSelicSource")}
          sourceHref="https://www.youtube.com/watch?v=WBNkhIaY7gc"
          note={t("homeVideoSelicNote")}
        />
      </section>
    </div>
  );
}
