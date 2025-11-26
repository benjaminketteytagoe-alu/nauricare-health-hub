import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/lib/auth";
import { Heart, Calendar, ClipboardList, BookOpen, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    setProfile(data);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">NauriCare</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">
            Welcome back, {profile.full_name.split(" ")[0]}!
          </h2>
          <p className="text-xl text-muted-foreground">
            How can we support your health today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          <DashboardCard
            icon={<Heart className="w-10 h-10" />}
            title="Check My Symptoms"
            description="Get guidance on PCOS and fibroid symptoms"
            onClick={() => navigate("/symptom-checker")}
            color="primary"
          />

          <DashboardCard
            icon={<Calendar className="w-10 h-10" />}
            title="My Appointments"
            description="View and manage your upcoming visits"
            onClick={() => navigate("/appointments")}
            color="secondary"
          />

          <DashboardCard
            icon={<ClipboardList className="w-10 h-10" />}
            title="My Care Plan"
            description="Track medications and lifestyle goals"
            onClick={() => navigate("/care-plan")}
            color="accent"
          />

          <DashboardCard
            icon={<BookOpen className="w-10 h-10" />}
            title="Learn & Community"
            description="Educational resources and support"
            onClick={() => navigate("/learn")}
            color="muted"
          />

          <DashboardCard
            icon={<Users className="w-10 h-10" />}
            title="Find a Specialist"
            description="Connect with verified clinicians"
            onClick={() => navigate("/specialists")}
            color="primary"
          />

          <DashboardCard
            icon={<Smartphone className="w-10 h-10" />}
            title="USSD Access"
            description="Learn about low-data access options"
            onClick={() => navigate("/ussd")}
            color="secondary"
          />
        </div>
      </main>
    </div>
  );
};

const DashboardCard = ({
  icon,
  title,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}) => (
  <Card
    className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
    onClick={onClick}
  >
    <div className={`text-${color} mb-4`}>{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

// Missing imports
import { Smartphone, Users } from "lucide-react";

export default Dashboard;
