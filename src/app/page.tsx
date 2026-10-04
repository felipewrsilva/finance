import { ContentStill, PhotoCredit } from "@/components/home/credited-photo";
import { ToolVideo } from "@/components/home/tool-video";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
import { tools } from "@/lib/copy";

const PHOTO_SIZES = "(max-width: 768px) 50vw, 360px";

export default function ToolsHome() {
  const cards = [
    {
      href: "/ferramentas/extra",
      index: tools.homeOneIndex,
      title: tools.redirectTitle,
      ask: tools.homeOneAsk,
      still: STILLS.spend,
      alt: tools.homeOnePhotoAlt,
      credit: tools.homeOnePhotoCredit,
      accent: true,
    },
    {
      href: "/ferramentas/orcamento",
      index: tools.homeTwoIndex,
      title: tools.allocationTitle,
      ask: tools.homeTwoAsk,
      still: STILLS.income,
      alt: tools.homeTwoPhotoAlt,
      credit: tools.homeTwoPhotoCredit,
      accent: false,
    },
    {
      href: "/ferramentas/projecao",
      index: tools.homeThreeIndex,
      title: tools.projectionTitle,
      ask: tools.homeThreeAsk,
      still: STILLS.time,
      alt: tools.homeThreePhotoAlt,
      credit: tools.homeThreePhotoCredit,
      accent: false,
    },
    {
      href: "/ferramentas/divisao",
      index: tools.homeFourIndex,
      title: tools.mixTitle,
      ask: tools.homeFourAsk,
      still: STILLS.mix,
      alt: tools.homeFourPhotoAlt,
      credit: tools.homeFourPhotoCredit,
      accent: false,
    },
    {
      href: "/ferramentas/comparar",
      index: tools.homeFiveIndex,
      title: tools.compareTitle,
      ask: tools.homeFiveAsk,
      still: STILLS.compare,
      alt: tools.homeFivePhotoAlt,
      credit: tools.homeFivePhotoCredit,
      accent: false,
    },
    {
      href: "/ferramentas/renda",
      index: tools.homeSixIndex,
      title: tools.freedomTitle,
      ask: tools.homeSixAsk,
      still: STILLS.freedom,
      alt: tools.homeSixPhotoAlt,
      credit: tools.homeSixPhotoCredit,
      accent: false,
    },
  ];

  return (
    <div className="pt-2 sm:pt-10">
      <h1 className="max-w-xl font-display text-[1.85rem] leading-[1.2] text-[var(--text)] sm:text-4xl md:text-5xl">
        {tools.homeTitle}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
        {tools.homeSubtitle}
      </p>

      <ol className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10">
        {cards.map((card) => (
          <li key={card.href} className={card.accent ? "sm:col-span-2" : undefined}>
            <figure>
              <a href={card.href} className="group block">
                <div className="relative">
                  <ContentStill
                    src={card.still.src}
                    alt={card.alt}
                    sizes={card.accent ? "(max-width: 768px) 100vw, 768px" : PHOTO_SIZES}
                    imageClassName={
                      card.accent
                        ? "h-44 w-full object-cover sm:h-56"
                        : "h-36 w-full object-cover sm:h-40"
                    }
                    priority={card.accent}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[var(--surface-elevated)]/95 px-2.5 py-1 text-xs tracking-wide text-[var(--text)] shadow-[var(--elevation-sm)]">
                    {card.index}
                  </span>
                </div>
                <h2
                  className={`mt-3 font-display leading-snug group-hover:text-[var(--primary)] ${
                    card.accent ? "text-[1.35rem] sm:text-3xl" : "text-lg sm:text-xl"
                  }`}
                >
                  {card.title}
                </h2>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                  {card.ask}
                </p>
              </a>
              <PhotoCredit href={card.still.href}>{card.credit}</PhotoCredit>
            </figure>
          </li>
        ))}
      </ol>

      <ToolVideo
        heading={tools.homeVideosTitle}
        lead={tools.homeVideosLead}
        videoId={VIDEOS.home.id}
        title={tools.homeVideoSelicTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.home.href}
        note={tools.homeVideoSelicNote}
      />
    </div>
  );
}
