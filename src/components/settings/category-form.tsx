"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BudgetGroupType, TransactionType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { createCategory, updateCategory } from "@/modules/categories/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const PRESET_ICONS = [
  "🏠", "🛒", "🍔", "🚗", "💊", "🎬", "✈️", "👗",
  "📱", "💡", "🎓", "🐾", "💰", "🎁", "🏋️", "☕",
  "🎮", "📚", "🌿", "🔧",
];

const GROUP_OPTIONS: BudgetGroupType[] = [
  "FIXED_COSTS",
  "COMFORT",
  "GOALS",
  "INVESTMENTS",
];

interface Props {
  category?: {
    id: string;
    name: string;
    type: TransactionType;
    icon: string | null;
    color: string | null;
    isEssential?: boolean;
    groupType?: BudgetGroupType | null;
  };
}

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const t = useTranslations("settings");
  const tf = useTranslations("form");
  const typeOptions: { value: TransactionType; label: string; color: string }[] = [
    { value: "EXPENSE", label: t("expenseLabel"), color: "text-red-600" },
    { value: "INCOME", label: t("incomeLabel"), color: "text-green-600" },
    { value: "INVESTMENT", label: t("investmentLabel"), color: "text-violet-600" },
  ];
  const [type, setType] = useState<TransactionType>(category?.type ?? "EXPENSE");
  const [icon, setIcon] = useState<string>(category?.icon ?? "");
  const [isEssential, setIsEssential] = useState(category?.isEssential ?? true);
  const [groupType, setGroupType] = useState<BudgetGroupType | "">(
    category?.groupType ?? ""
  );

  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="isEssential" value={String(isEssential)} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")}</label>
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                type === opt.value
                  ? `bg-white shadow-sm ${opt.color}`
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t("name")}</label>
        <input
          name="name"
          defaultValue={category?.name ?? ""}
          placeholder={t("categoryNamePlaceholder")}
          required
          className={inputCls}
        />
      </div>

      {type === "EXPENSE" && (
        <>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">{t("essentialLabel")}</p>
              <p className="text-xs text-gray-400">{t("essentialHint")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isEssential}
              onClick={() => setIsEssential((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                isEssential ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  isEssential ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("groupTypeLabel")}{" "}
              <span className="text-gray-400 font-normal">{tf("optional")}</span>
            </label>
            <select
              name="groupType"
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as BudgetGroupType | "")}
              className={inputCls}
            >
              <option value="">{t("groupTypeNone")}</option>
              {GROUP_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {t(`groupType_${g}`)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("icon")} <span className="text-gray-400 font-normal">{tf("optional")}</span>
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
            {t("selectedIcon")} <span className="text-base">{icon}</span>{" "}
            <button
              type="button"
              onClick={() => setIcon("")}
              className="text-indigo-600 hover:underline"
            >
              {t("clearIcon")}
            </button>
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton className="flex-1 rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white hover:bg-indigo-700">
          {category ? t("saveChanges") : t("createCategory")}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
