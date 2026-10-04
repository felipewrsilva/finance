import { ContentStill, PhotoCredit } from "@/components/home/credited-photo";
import { ToolVideo } from "@/components/home/tool-video";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
import { tools } from "@/lib/copy";

const PHOTO_SIZES = "(max-width: 768px) 100vw, 768px";

export default function ToolsHome() {
  const cards = [
    {
      href: "/ferramentas/redirecionar",
      index: tools.homeOneIndex,
      title: tools.redirectTitle,
      ask: tools.homeOneAsk,
      still: STILLS.spend,
      alt: tools.homeOnePhotoAlt,
      credit: tools.homeOnePhotoCredit,
      accent: true,
    },
    {
      href: "/ferramentas/alocacao",
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
  ];

  return (
    <div className="pt-2 sm:pt-10">
      <h1 className="max-w-xl font-display text-[1.85rem] leading-[1.2] text-[var(--text)] sm:text-4xl md:text-5xl">
        {tools.homeTitle}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
        {tools.homeSubtitle}
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
