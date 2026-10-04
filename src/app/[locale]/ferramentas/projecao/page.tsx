import { getTranslations } from "next-intl/server";
import { ProjectionTool } from "@/components/tools/projection-tool";

export default async function ProjectionPage() {
  const t = await getTranslations("tools");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("projectionTitle")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("projectionBlurb")}</p>
      </div>
      <ProjectionTool />
    </div>
  );
}
