"use client";

import { useState } from "react";

interface InlineConfirmButtonProps {
  onConfirm?: () => void;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  /** When true, renders the trigger as text rather than a trash icon */
  showAsText?: boolean;
}

// Trash icon — 16 × 16, accessible
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 6.527A2 2 0 0 0 5.845 14h4.31a2 2 0 0 0 1.98-1.973L12.95 5.5h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function InlineConfirmButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  className,
  showAsText = false,
}: InlineConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type={onConfirm ? "button" : "submit"}
          onClick={
            onConfirm
              ? () => {
                  onConfirm();
                  setConfirming(false);
                }
              : undefined
          }
          className="min-h-[36px] rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white active:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-[36px] rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 active:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1"
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  if (showAsText) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          className ??
          "rounded px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
        }
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={label}
      className={
        className ??
        "flex min-h-[44px] w-9 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400 active:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
      }
    >
      <TrashIcon />
    </button>
  );
}
