export function SemeiaMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
      <path
        d="M24 36.5c0-9 4.2-14.5 12-16.5-2.8 8.2-7.4 12.4-12 16.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M24 36.5c0-10-5.2-16-12.8-18.2C14.4 26.4 19.2 31.4 24 36.5Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path d="M24 36.5V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
