import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { RedirectTool } from "@/components/tools/redirect-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
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
      <ToolVideo
        heading={tools.redirectVideoHeading}
        lead={tools.redirectVideoLead}
        videoId={VIDEOS.spend.id}
        title={tools.redirectVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.spend.href}
        note={tools.redirectVideoNote}
      />
    </div>
  );
}
