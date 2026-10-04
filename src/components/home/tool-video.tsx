import { YoutubeClip } from "@/components/home/youtube-clip";

export function ToolVideo({
  heading,
  lead,
  videoId,
  title,
  source,
  sourceHref,
  note,
}: {
  heading: string;
  lead: string;
  videoId: string;
  title: string;
  source: string;
  sourceHref: string;
  note: string;
}) {
  return (
    <section className="mt-12 border-t border-[var(--border)] pt-10 sm:mt-14">
      <div className="mb-6 max-w-md">
        <h2 className="font-display text-2xl leading-snug text-[var(--text)] sm:text-3xl">
          {heading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          {lead}
        </p>
      </div>
      <YoutubeClip
        videoId={videoId}
        title={title}
        source={source}
        sourceHref={sourceHref}
        note={note}
      />
    </section>
  );
}
