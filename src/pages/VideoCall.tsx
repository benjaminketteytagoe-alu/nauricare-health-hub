import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VideoCall = () => {
  const { specialistId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callStatus, setCallStatus] = useState<"connecting" | "waiting" | "connected">("connecting");

  const specialistName = location.state?.specialistName || "Specialist";

  useEffect(() => {
    startLocalStream();
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnecting(false);
      setCallStatus("waiting");
      
      toast({
        title: "Camera Connected",
        description: "Waiting for the specialist to join...",
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera and microphone access to use video call.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    toast({
      title: "Call Ended",
      description: "Your video call has ended.",
    });
    navigate("/specialists");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/specialists")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Video Consultation</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold mb-1">Consultation with {specialistName}</h2>
            <p className="text-muted-foreground">
              {callStatus === "connecting" && "Connecting to camera..."}
              {callStatus === "waiting" && "Waiting for specialist to join..."}
              {callStatus === "connected" && "Connected"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Local Video (User) */}
            <Card className="relative aspect-video bg-muted overflow-hidden">
              {isConnecting ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">
                    Accessing camera...
                  </div>
                </div>
              ) : !isVideoEnabled ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <User className="w-20 h-20 text-muted-foreground" />
                </div>
              ) : null}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              <div className="absolute bottom-3 left-3 bg-background/80 px-2 py-1 rounded text-sm">
                You
              </div>
            </Card>

            {/* Remote Video (Specialist) - Placeholder */}
            <Card className="relative aspect-video bg-muted overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <User className="w-20 h-20 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center px-4">
                  {specialistName} will appear here when they join
                </p>
              </div>
              <div className="absolute bottom-3 left-3 bg-background/80 px-2 py-1 rounded text-sm">
                {specialistName}
              </div>
            </Card>
          </div>

          {/* Call Controls */}
          <Card className="p-6">
            <div className="flex justify-center gap-4">
              <Button
                variant={isVideoEnabled ? "outline" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-14 h-14"
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                variant={isAudioEnabled ? "outline" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-14 h-14"
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full w-14 h-14"
              >
                <Phone className="w-6 h-6 rotate-[135deg]" />
              </Button>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Your video is being streamed securely. The specialist will join shortly.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VideoCall;
