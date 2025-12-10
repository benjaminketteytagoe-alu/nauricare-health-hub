import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft, BookOpen, Play, FileText, Download, ArrowRight, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { downloadMaterialPDF } from "@/lib/pdfGenerator";
import { useState } from "react";
import { toast } from "sonner";
import { VideoPlayerDialog } from "@/components/VideoPlayerDialog";
const articles = [
  {
    id: "pcos-basics",
    title: "Understanding PCOS",
    category: "PCOS",
    summary:
      "Learn about Polycystic Ovary Syndrome, its causes, symptoms, and how it affects women across Africa.",
    readTime: "8 min read",
  },
  {
    id: "fibroids-basics",
    title: "Understanding Fibroids",
    category: "Fibroids",
    summary:
      "What are uterine fibroids, who gets them, and what treatment options are available?",
    readTime: "10 min read",
  },
  {
    id: "mental-health",
    title: "Managing Stress & Mental Health",
    category: "Wellness",
    summary:
      "The connection between reproductive health conditions and mental well-being, and strategies for coping.",
    readTime: "7 min read",
  },
  {
    id: "partner-communication",
    title: "Talking to Your Partner",
    category: "Relationships",
    summary:
      "How to communicate about your health challenges with your partner and maintain a healthy relationship.",
    readTime: "6 min read",
  },
];

const videos = [
  {
    id: "pcos-explained",
    title: "PCOS Explained: What Every Woman Should Know",
    category: "PCOS",
    duration: "12:34",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=225&fit=crop",
    source: "NauriCare Health Series",
    description: "A comprehensive guide to understanding PCOS symptoms, diagnosis, and management options.",
  },
  {
    id: "fibroid-treatment",
    title: "Fibroid Treatment Options in 2024",
    category: "Fibroids",
    duration: "15:22",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=225&fit=crop",
    source: "NauriCare Health Series",
    description: "Learn about the latest treatments available for uterine fibroids, from medication to surgery.",
  },
  {
    id: "nutrition-hormones",
    title: "Nutrition for Hormonal Balance",
    category: "Wellness",
    duration: "18:45",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop",
    source: "NauriCare Nutrition",
    description: "Dietary tips and meal planning strategies to help manage PCOS and fibroid symptoms naturally.",
  },
  {
    id: "african-women-health",
    title: "African Women's Health: Breaking the Silence",
    category: "Community",
    duration: "22:10",
    thumbnail: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=225&fit=crop",
    source: "NauriCare Stories",
    description: "Real stories from African women managing reproductive health conditions with strength and grace.",
  },
];

const materials = [
  {
    id: "pcos-guide",
    title: "Complete PCOS Management Guide",
    type: "PDF Guide",
    pages: 24,
    category: "PCOS",
    description: "A comprehensive downloadable guide covering symptoms, lifestyle changes, and treatment options.",
  },
  {
    id: "meal-plan",
    title: "7-Day Hormone-Balancing Meal Plan",
    type: "Meal Plan",
    pages: 12,
    category: "Nutrition",
    description: "Weekly meal plan with African-inspired recipes designed to support hormonal health.",
  },
  {
    id: "symptom-diary",
    title: "Symptom Tracking Diary",
    type: "Printable",
    pages: 8,
    category: "Tracking",
    description: "Printable diary pages to track your symptoms, periods, and mood patterns.",
  },
  {
    id: "questions-doctor",
    title: "Questions to Ask Your Doctor",
    type: "Checklist",
    pages: 4,
    category: "Healthcare",
    description: "Prepared questions to help you make the most of your specialist consultations.",
  },
  {
    id: "exercise-guide",
    title: "Gentle Exercise Guide for PCOS & Fibroids",
    type: "PDF Guide",
    pages: 16,
    category: "Fitness",
    description: "Safe, effective exercises designed specifically for women with reproductive health conditions.",
  },
  {
    id: "fibroid-factsheet",
    title: "Fibroid Facts: What You Need to Know",
    type: "Fact Sheet",
    pages: 2,
    category: "Fibroids",
    description: "Quick reference fact sheet about fibroids, symptoms, and when to seek help.",
  },
];

const Learn = () => {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);

  const handleVideoClick = (video: typeof videos[0]) => {
    setSelectedVideo(video);
    setVideoDialogOpen(true);
  };

  const handleDownload = async (materialId: string, title: string) => {
    setDownloadingId(materialId);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      downloadMaterialPDF(materialId, title);
      toast.success(`Downloaded ${title}`);
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    } finally {
      setDownloadingId(null);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Learn & Community</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Knowledge is Power</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn about PCOS, fibroids, and reproductive health through articles, videos, and downloadable resources.
            </p>
          </div>

          <Tabs defaultValue="articles" className="mb-12">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Materials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles">
              <div className="grid gap-6">
                {articles.map((article) => (
                  <Card 
                    key={article.id} 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{article.category}</Badge>
                          <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{article.title}</h3>
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-muted-foreground mb-4">{article.summary}</p>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/article/${article.id}`); }}>
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <Card 
                    key={video.id} 
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                      <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                        {video.duration}
                      </Badge>
                    </div>
                    <div className="p-5">
                      <Badge variant="outline" className="mb-2">{video.category}</Badge>
                      <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                      <p className="text-xs text-primary font-medium">{video.source}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="materials">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <Card key={material.id} className="p-5 hover:shadow-lg transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{material.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{material.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-grow">{material.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {material.type} • {material.pages} pages
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(material.id, material.title)}
                        disabled={downloadingId === material.id}
                      >
                        {downloadingId === material.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-1" />
                        )}
                        {downloadingId === material.id ? "Generating..." : "Download"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Support (Coming Soon)</h3>
                <p className="text-muted-foreground mb-4">
                  We're building a safe, moderated community where women can share experiences, ask questions, 
                  and support each other through their health journeys. Stay tuned for updates!
                </p>
                <p className="text-sm text-muted-foreground">
                  In the meantime, connect with verified healthcare providers through our specialist directory.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <VideoPlayerDialog
        video={selectedVideo}
        open={videoDialogOpen}
        onOpenChange={setVideoDialogOpen}
      />
    </div>
  );
};

export default Learn;
