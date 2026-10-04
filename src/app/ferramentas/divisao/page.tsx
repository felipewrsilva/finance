import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { MixTool } from "@/components/tools/mix-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
import { tools } from "@/lib/copy";

export default function MixPage() {
  return (
    <div>
      <ToolIntro
        title={tools.mixTitle}
        ask={tools.mixAsk}
        photo={{
          src: STILLS.mix.src,
          href: STILLS.mix.href,
          alt: tools.homeFourPhotoAlt,
          credit: tools.homeFourPhotoCredit,
        }}
      />
      <MixTool />
      <ToolVideo
        heading={tools.mixVideoHeading}
        lead={tools.mixVideoLead}
        videoId={VIDEOS.mix.id}
        title={tools.mixVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.mix.href}
        note={tools.mixVideoNote}
      />
    </div>
  );
}
