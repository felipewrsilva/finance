"use client";

import { useFormStatus } from "react-dom";

interface Props {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  disabled?: boolean;
}

export function SubmitButton({ children, className, pendingText, disabled }: Props) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={`${className ?? ""}${pending ? " opacity-60" : ""}`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {pendingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
