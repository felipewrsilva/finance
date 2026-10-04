import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { CompareTool } from "@/components/tools/compare-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
import { tools } from "@/lib/copy";

export default function ComparePage() {
  return (
    <div>
      <ToolIntro
        title={tools.compareTitle}
        ask={tools.compareAsk}
        photo={{
          src: STILLS.compare.src,
          href: STILLS.compare.href,
          alt: tools.homeFivePhotoAlt,
          credit: tools.homeFivePhotoCredit,
        }}
      />
      <CompareTool />
      <ToolVideo
        heading={tools.compareVideoHeading}
        lead={tools.compareVideoLead}
        videoId={VIDEOS.compare.id}
        title={tools.compareVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.compare.href}
        note={tools.compareVideoNote}
      />
    </div>
  );
}
