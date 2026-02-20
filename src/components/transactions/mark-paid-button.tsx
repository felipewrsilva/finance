"use client";

import { useTransition } from "react";
import { markTransactionPaid } from "@/modules/transactions/actions";

export function MarkPaidButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          markTransactionPaid(id);
        })
      }
      className="shrink-0 rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
    >
      {isPending ? "…" : "✓ Pay"}
    </button>
  );
}
