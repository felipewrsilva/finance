import { getTranslations } from "next-intl/server";
import { ToolIntro } from "@/components/tools/tool-intro";
import { RedirectTool } from "@/components/tools/redirect-tool";
import { STILLS } from "@/lib/stills";

export default async function RedirectPage() {
  const t = await getTranslations("tools");
  return (
    <div>
      <ToolIntro
        title={t("redirectTitle")}
        ask={t("redirectAsk")}
        photo={{
          src: STILLS.spend.src,
          href: STILLS.spend.href,
          alt: t("homeOnePhotoAlt"),
          credit: t("homeOnePhotoCredit"),
        }}
      />
      <RedirectTool />
    </div>
  );
}
