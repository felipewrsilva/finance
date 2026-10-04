interface Props {
  videoId: string;
  title: string;
  source: string;
  sourceHref: string;
  note: string;
}

export function YoutubeClip({ videoId, title, source, sourceHref, note }: Props) {
  return (
    <figure className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--surface-muted)] pt-[56.25%]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption className="text-sm leading-relaxed text-[var(--text-secondary)]">
        <p className="font-medium text-[var(--text)]">{title}</p>
        <p className="mt-1">
          {note}{" "}
          <a
            href={sourceHref}
            className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text)]"
          >
            {source}
          </a>
          .
        </p>
      </figcaption>
    </figure>
  );
}
