import { ContentStill, PhotoCredit } from "@/components/home/credited-photo";

const PHOTO_SIZES = "(max-width: 768px) 100vw, 768px";

export function ToolIntro({
  title,
  ask,
  photo,
}: {
  title: string;
  ask?: string;
  photo: { src: string; alt: string; credit: string; href: string };
}) {
  return (
    <header className="mb-8 sm:mb-10">
      <h1 className="font-display text-[1.65rem] leading-snug text-[var(--text)] sm:text-3xl md:text-4xl">
        {title}
      </h1>
      <figure className="mt-5 sm:mt-6">
        <ContentStill
          src={photo.src}
          alt={photo.alt}
          sizes={PHOTO_SIZES}
          imageClassName="h-44 w-full object-cover sm:h-56"
          priority
        />
        <PhotoCredit href={photo.href}>{photo.credit}</PhotoCredit>
      </figure>
      {ask ? (
        <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          {ask}
        </p>
      ) : null}
    </header>
  );
}
