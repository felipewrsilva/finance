import { getTranslations } from "next-intl/server";
import { ToolIntro } from "@/components/tools/tool-intro";
import { ProjectionTool } from "@/components/tools/projection-tool";

export default async function ProjectionPage() {
  const t = await getTranslations("tools");
  return (
    <div>
      <ToolIntro title={t("projectionTitle")} ask={t("projectionAsk")} />
      <ProjectionTool />
    </div>
  );
}
