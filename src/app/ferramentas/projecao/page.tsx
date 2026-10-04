import { ToolIntro } from "@/components/tools/tool-intro";
import { ProjectionTool } from "@/components/tools/projection-tool";
import { STILLS } from "@/lib/stills";
import { tools } from "@/lib/copy";

export default function ProjectionPage() {
  return (
    <div>
      <ToolIntro
        title={tools.projectionTitle}
        ask={tools.projectionAsk}
        photo={{
          src: STILLS.time.src,
          href: STILLS.time.href,
          alt: tools.homeThreePhotoAlt,
          credit: tools.homeThreePhotoCredit,
        }}
      />
      <ProjectionTool />
    </div>
  );
}
