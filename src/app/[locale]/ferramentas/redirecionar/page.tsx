import { getTranslations } from "next-intl/server";
import { RedirectTool } from "@/components/tools/redirect-tool";

export default async function RedirectPage() {
  const t = await getTranslations("tools");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("redirectTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("redirectBlurb")}</p>
      </div>
      <RedirectTool />
    </div>
  );
}
