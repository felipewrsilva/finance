import { getTranslations } from "next-intl/server";
import { ToolIntro } from "@/components/tools/tool-intro";
import { AllocationTool } from "@/components/tools/allocation-tool";
import { STILLS } from "@/lib/stills";

export default async function AllocationPage() {
  const t = await getTranslations("tools");
  return (
    <div>
      <ToolIntro
        title={t("allocationTitle")}
        ask={t("allocationAsk")}
        photo={{
          src: STILLS.income.src,
          href: STILLS.income.href,
          alt: t("homeTwoPhotoAlt"),
          credit: t("homeTwoPhotoCredit"),
        }}
      />
      <AllocationTool />
    </div>
  );
}
