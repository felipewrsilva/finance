import Image from "next/image";

interface PhotoProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function ContentStill({ src, alt, sizes, className, imageClassName, priority }: PhotoProps) {
  return (
    <div className={className ?? "relative overflow-hidden rounded-2xl bg-[var(--surface-muted)]"}>
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={900}
          sizes={sizes}
          priority={priority}
          unoptimized
          className={imageClassName ?? "h-48 w-full object-cover sm:h-64"}
        />
    </div>
  );
}

export function PhotoCredit({ href, children }: { href: string; children: string }) {
  return (
    <figcaption className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
      <a
        href={href}
        className="underline decoration-[var(--border)] underline-offset-2 hover:text-[var(--text-secondary)]"
      >
        {children}
      </a>
    </figcaption>
  );
}
