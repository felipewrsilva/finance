"use client";

import { useTranslations } from "next-intl";
import { InlineConfirmButton } from "@/components/ui/inline-confirm-button";

export interface CurrencyRowProps {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
  /** False when this is the only enabled currency — prevents removing it. */
  canRemove: boolean;
  onMakeDefault: () => void;
  onRemove: () => void;
}

export function CurrencyRow({
  code,
  name,
  flag,
  isDefault,
  canRemove,
  onMakeDefault,
  onRemove,
}: CurrencyRowProps) {
  const t = useTranslations("settings");
  return (
    <li className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Flag + name */}
      <span className="text-xl leading-none select-none" aria-hidden="true">
        {flag}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900">
          {name}
        </span>
        <span className="ml-1.5 text-sm text-gray-400">{code}</span>
        {isDefault && (
          <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
            {t("defaultBadge")}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!isDefault && (
          <button
            type="button"
            onClick={onMakeDefault}
            className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
          >
            {t("makeDefault")}
          </button>
        )}
        {!isDefault && canRemove && (
          <InlineConfirmButton
            label={t("remove")}
            confirmLabel={t("yesRemove")}
            cancelLabel={t("cancel")}
            onConfirm={onRemove}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          />
        )}
      </div>
    </li>
  );
}
