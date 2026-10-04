import { ToolIntro } from "@/components/tools/tool-intro";
import { ToolVideo } from "@/components/home/tool-video";
import { ProjectionTool } from "@/components/tools/projection-tool";
import { STILLS } from "@/lib/stills";
import { VIDEOS } from "@/lib/videos";
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
      <ToolVideo
        heading={tools.projectionVideoHeading}
        lead={tools.projectionVideoLead}
        videoId={VIDEOS.time.id}
        title={tools.projectionVideoTitle}
        source={tools.videoWatch}
        sourceHref={VIDEOS.time.href}
        note={tools.projectionVideoNote}
      />
    </div>
  );
}
