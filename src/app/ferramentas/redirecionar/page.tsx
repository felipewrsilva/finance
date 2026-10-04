import { ToolIntro } from "@/components/tools/tool-intro";
import { RedirectTool } from "@/components/tools/redirect-tool";
import { STILLS } from "@/lib/stills";
import { tools } from "@/lib/copy";

export default function RedirectPage() {
  return (
    <div>
      <ToolIntro
        title={tools.redirectTitle}
        ask={tools.redirectAsk}
        photo={{
          src: STILLS.spend.src,
          href: STILLS.spend.href,
          alt: tools.homeOnePhotoAlt,
          credit: tools.homeOnePhotoCredit,
        }}
      />
      <RedirectTool />
    </div>
  );
}
