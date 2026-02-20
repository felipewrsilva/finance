"use client";

import { useState } from "react";

interface InlineConfirmButtonProps {
  onConfirm?: () => void;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function InlineConfirmButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  className,
}: InlineConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          // When onConfirm is provided, use type="button"; otherwise type="submit" to submit parent form
          type={onConfirm ? "button" : "submit"}
          onClick={
            onConfirm
              ? () => {
                  onConfirm();
                  setConfirming(false);
                }
              : undefined
          }
          className="min-h-[36px] rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white active:bg-red-600"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="min-h-[36px] rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 active:bg-gray-100"
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={
        className ??
        "min-h-[36px] rounded-lg border border-red-100 px-3 py-1 text-xs text-red-500 hover:bg-red-50 active:bg-red-100"
      }
    >
      {label}
    </button>
  );
}
