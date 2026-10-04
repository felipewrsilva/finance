import { ToolIntro } from "@/components/tools/tool-intro";
import { AllocationTool } from "@/components/tools/allocation-tool";
import { STILLS } from "@/lib/stills";
import { tools } from "@/lib/copy";

export default function AllocationPage() {
  return (
    <div>
      <ToolIntro
        title={tools.allocationTitle}
        ask={tools.allocationAsk}
        photo={{
          src: STILLS.income.src,
          href: STILLS.income.href,
          alt: tools.homeTwoPhotoAlt,
          credit: tools.homeTwoPhotoCredit,
        }}
      />
      <AllocationTool />
    </div>
  );
}
