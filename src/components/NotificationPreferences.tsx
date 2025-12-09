import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Mail, Loader2 } from "lucide-react";

interface NotificationPrefs {
  email_appointments: boolean;
  email_care_plan_reminders: boolean;
  email_health_tips: boolean;
  email_newsletter: boolean;
  in_app_appointments: boolean;
  in_app_care_plan_reminders: boolean;
  in_app_symptom_alerts: boolean;
}

const defaultPrefs: NotificationPrefs = {
  email_appointments: true,
  email_care_plan_reminders: true,
  email_health_tips: true,
  email_newsletter: false,
  in_app_appointments: true,
  in_app_care_plan_reminders: true,
  in_app_symptom_alerts: true,
};

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>(defaultPrefs);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          email_appointments: data.email_appointments ?? true,
          email_care_plan_reminders: data.email_care_plan_reminders ?? true,
          email_health_tips: data.email_health_tips ?? true,
          email_newsletter: data.email_newsletter ?? false,
          in_app_appointments: data.in_app_appointments ?? true,
          in_app_care_plan_reminders: data.in_app_care_plan_reminders ?? true,
          in_app_symptom_alerts: data.in_app_symptom_alerts ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSaving(true);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control how and when you receive notifications from NauriCare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Email Notifications</h3>
          </div>
          <div className="space-y-4 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_appointments" className="flex-1">
                <span className="font-medium">Appointment reminders</span>
                <p className="text-sm text-muted-foreground">
                  Receive email reminders before your scheduled appointments
                </p>
              </Label>
              <Switch
                id="email_appointments"
                checked={preferences.email_appointments}
                onCheckedChange={(checked) => updatePreference("email_appointments", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email_care_plan" className="flex-1">
                <span className="font-medium">Care plan reminders</span>
                <p className="text-sm text-muted-foreground">
                  Daily reminders for medications and lifestyle activities
                </p>
              </Label>
              <Switch
                id="email_care_plan"
                checked={preferences.email_care_plan_reminders}
                onCheckedChange={(checked) => updatePreference("email_care_plan_reminders", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email_health_tips" className="flex-1">
                <span className="font-medium">Health tips & articles</span>
                <p className="text-sm text-muted-foreground">
                  Curated health tips and new educational content
                </p>
              </Label>
              <Switch
                id="email_health_tips"
                checked={preferences.email_health_tips}
                onCheckedChange={(checked) => updatePreference("email_health_tips", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email_newsletter" className="flex-1">
                <span className="font-medium">Newsletter</span>
                <p className="text-sm text-muted-foreground">
                  Monthly updates about NauriCare features and community news
                </p>
              </Label>
              <Switch
                id="email_newsletter"
                checked={preferences.email_newsletter}
                onCheckedChange={(checked) => updatePreference("email_newsletter", checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* In-App Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">In-App Notifications</h3>
          </div>
          <div className="space-y-4 ml-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="in_app_appointments" className="flex-1">
                <span className="font-medium">Appointment updates</span>
                <p className="text-sm text-muted-foreground">
                  Notifications about appointment confirmations and changes
                </p>
              </Label>
              <Switch
                id="in_app_appointments"
                checked={preferences.in_app_appointments}
                onCheckedChange={(checked) => updatePreference("in_app_appointments", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="in_app_care_plan" className="flex-1">
                <span className="font-medium">Care plan reminders</span>
                <p className="text-sm text-muted-foreground">
                  In-app reminders for your daily health activities
                </p>
              </Label>
              <Switch
                id="in_app_care_plan"
                checked={preferences.in_app_care_plan_reminders}
                onCheckedChange={(checked) => updatePreference("in_app_care_plan_reminders", checked)}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="in_app_symptom_alerts" className="flex-1">
                <span className="font-medium">Symptom tracking alerts</span>
                <p className="text-sm text-muted-foreground">
                  Alerts when symptom patterns need attention
                </p>
              </Label>
              <Switch
                id="in_app_symptom_alerts"
                checked={preferences.in_app_symptom_alerts}
                onCheckedChange={(checked) => updatePreference("in_app_symptom_alerts", checked)}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
