"use client";

import { useState } from "react";
import type { Frequency } from "@prisma/client";

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

interface RecurringSectionProps {
  defaultIsRecurring?: boolean;
  defaultFrequency?: Frequency;
  defaultRecurrenceEnd?: Date | null;
}

export function RecurringSection({
  defaultIsRecurring = false,
  defaultFrequency = "MONTHLY",
  defaultRecurrenceEnd = null,
}: RecurringSectionProps) {
  const [isRecurring, setIsRecurring] = useState(defaultIsRecurring);
  const [frequency, setFrequency] = useState<Frequency>(defaultFrequency);

  const defaultEndStr = defaultRecurrenceEnd
    ? new Date(defaultRecurrenceEnd).toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-3">
      {/* Hidden inputs for form submission */}
      <input type="hidden" name="isRecurring" value={isRecurring ? "true" : "false"} />
      {isRecurring && <input type="hidden" name="frequency" value={frequency} />}

      {/* Toggle */}
      <label className="flex cursor-pointer items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isRecurring}
          onClick={() => setIsRecurring((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isRecurring ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isRecurring ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700">Repeat this transaction</span>
      </label>

      {/* Expanded section */}
      {isRecurring && (
        <div className="ml-14 space-y-3">
          {/* Frequency segmented control */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Frequency
            </p>
            <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
              {FREQUENCY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    frequency === value
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* End date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              End date{" "}
              <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <input
              name="recurrenceEnd"
              type="date"
              defaultValue={defaultEndStr}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
