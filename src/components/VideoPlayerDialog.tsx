import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  title: string;
  category: string;
  duration: string;
  source: string;
  description: string;
  videoUrl?: string;
}

interface VideoPlayerDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo video URLs for each video ID
const videoUrls: Record<string, string> = {
  "pcos-explained": "https://www.youtube.com/embed/4mMk2TvmGDI",
  "fibroid-treatment": "https://www.youtube.com/embed/GJzuF1twSyY",
  "nutrition-hormones": "https://www.youtube.com/embed/5VRMr7LBJsQ",
  "african-women-health": "https://www.youtube.com/embed/dQw4w9WgXcQ",
};

export const VideoPlayerDialog = ({ video, open, onOpenChange }: VideoPlayerDialogProps) => {
  if (!video) return null;

  const embedUrl = videoUrls[video.id] || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{video.category}</Badge>
            <span className="text-sm text-muted-foreground">{video.duration}</span>
          </div>
          <DialogTitle className="text-xl">{video.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{video.source}</p>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <div className="p-4 pt-2">
          <p className="text-muted-foreground">{video.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
