import { getTranslations } from "next-intl/server";
import { ToolIntro } from "@/components/tools/tool-intro";
import { ProjectionTool } from "@/components/tools/projection-tool";
import { STILLS } from "@/lib/stills";

export default async function ProjectionPage() {
  const t = await getTranslations("tools");
  return (
    <div>
      <ToolIntro
        title={t("projectionTitle")}
        ask={t("projectionAsk")}
        photo={{
          src: STILLS.time.src,
          href: STILLS.time.href,
          alt: t("homeThreePhotoAlt"),
          credit: t("homeThreePhotoCredit"),
        }}
      />
      <ProjectionTool />
    </div>
  );
}
