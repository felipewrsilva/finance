import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { FreedomTool } from "@/components/tools/freedom-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
import { tools } from "@/lib/copy";

export default function FreedomPage() {
  return (
    <div>
      <ToolIntro
        title={tools.freedomTitle}
        ask={tools.freedomAsk}
        photo={{
          src: STILLS.freedom.src,
          href: STILLS.freedom.href,
          alt: tools.homeSixPhotoAlt,
          credit: tools.homeSixPhotoCredit,
        }}
      />
      <FreedomTool />
      <ToolVideo
        heading={tools.freedomVideoHeading}
        lead={tools.freedomVideoLead}
        videoId={VIDEOS.freedom.id}
        title={tools.freedomVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.freedom.href}
        note={tools.freedomVideoNote}
      />
    </div>
  );
}
