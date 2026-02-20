"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionType } from "@prisma/client";
import { createCategory, updateCategory } from "@/modules/categories/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: "EXPENSE", label: "Expense", color: "text-red-600" },
  { value: "INCOME", label: "Income", color: "text-green-600" },
];

const PRESET_ICONS = [
  "🏠", "🛒", "🍔", "🚗", "💊", "🎬", "✈️", "👗",
  "📱", "💡", "🎓", "🐾", "💰", "🎁", "🏋️", "☕",
  "🎮", "📚", "🌿", "🔧",
];

interface Props {
  category?: {
    id: string;
    name: string;
    type: TransactionType;
    icon: string | null;
    color: string | null;
  };
}

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>(
    category?.type ?? "EXPENSE"
  );
  const [icon, setIcon] = useState<string>(category?.icon ?? "");

  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="icon" value={icon} />

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === t.value
                  ? `bg-white shadow-sm ${t.color}`
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          name="name"
          defaultValue={category?.name ?? ""}
          placeholder="e.g. Streaming, Gym"
          required
          className={inputCls}
        />
      </div>

      {/* Icon picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(icon === emoji ? "" : emoji)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                icon === emoji
                  ? "bg-indigo-100 ring-2 ring-indigo-500"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {icon && (
          <p className="text-xs text-gray-500">
            Selected: <span className="text-base">{icon}</span>{" "}
            <button
              type="button"
              onClick={() => setIcon("")}
              className="text-indigo-600 hover:underline"
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <SubmitButton
          className="flex-1 rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700"
        >
          {category ? "Save changes" : "Create category"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
