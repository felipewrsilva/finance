import { getTranslations } from "next-intl/server";
import { AllocationTool } from "@/components/tools/allocation-tool";

export default async function AllocationPage() {
  const t = await getTranslations("tools");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("allocationTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("allocationBlurb")}</p>
      </div>
      <AllocationTool />
    </div>
  );
}
