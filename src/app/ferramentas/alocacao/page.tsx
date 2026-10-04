import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { AllocationTool } from "@/components/tools/allocation-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
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
      <ToolVideo
        heading={tools.allocationVideoHeading}
        lead={tools.allocationVideoLead}
        videoId={VIDEOS.income.id}
        title={tools.allocationVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.income.href}
        note={tools.allocationVideoNote}
      />
    </div>
  );
}
