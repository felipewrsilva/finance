import { getTranslations } from "next-intl/server";
import { ToolIntro } from "@/components/tools/tool-intro";
import { RedirectTool } from "@/components/tools/redirect-tool";

export default async function RedirectPage() {
  const t = await getTranslations("tools");
  return (
    <div>
      <ToolIntro title={t("redirectTitle")} />
      <RedirectTool />
    </div>
  );
}
