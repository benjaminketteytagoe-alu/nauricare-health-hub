import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoHorizontal from "@/assets/logo-horizontal.png";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

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
      .maybeSingle();
    setProfile(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={logoHorizontal} alt="NauriCare" className="h-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your profile picture and personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload
                userId={user?.id || ""}
                currentAvatarUrl={profile?.avatar_url}
                userName={profile?.full_name}
                onUploadComplete={(url) => setProfile({ ...profile, avatar_url: url })}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <ThemeToggle />

          {/* Notification Preferences */}
          <NotificationPreferences />
        </div>
      </main>
    </div>
  );
};

export default Settings;
