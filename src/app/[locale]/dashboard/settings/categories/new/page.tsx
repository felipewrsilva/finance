import { CategoryForm } from "@/components/settings/category-form";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function NewCategoryPage({ params }: Props) {
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t("newCategoryTitle")}</h1>
        <p className="text-sm text-gray-500">{t("newCategorySubtitle")}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm max-w-lg">
        <CategoryForm />
      </div>
    </div>
  );
}
