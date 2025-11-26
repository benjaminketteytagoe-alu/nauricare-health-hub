import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ArrowLeft, Pill, Activity, Calendar } from "lucide-react";

const CarePlan = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCarePlans();
    }
  }, [user]);

  const fetchCarePlans = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("patient_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profileData) return;

    const { data: plansData } = await supabase
      .from("care_plans")
      .select("*")
      .eq("patient_id", profileData.id);

    if (plansData && plansData.length > 0) {
      setCarePlans(plansData);
      
      const { data: itemsData } = await supabase
        .from("care_plan_items")
        .select("*")
        .in("care_plan_id", plansData.map(p => p.id))
        .order("created_at", { ascending: true });

      if (itemsData) {
        setItems(itemsData);
      }
    }

    setLoading(false);
  };

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    await supabase
      .from("care_plan_items")
      .update({ completed_today: !currentStatus })
      .eq("id", itemId);

    setItems(items.map(item => 
      item.id === itemId ? { ...item, completed_today: !currentStatus } : item
    ));
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="w-5 h-5" />;
      case "exercise":
      case "lifestyle":
        return <Activity className="w-5 h-5" />;
      case "appointment":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading care plan...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">My Care Plan</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {carePlans.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Care Plan Yet</h3>
              <p className="text-muted-foreground mb-6">
                Your care plan will appear here once created by your healthcare provider.
              </p>
              <Button onClick={() => navigate("/specialists")}>Book a Consultation</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {carePlans.map((plan) => (
                <div key={plan.id}>
                  <Card className="p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
                    {plan.description && (
                      <p className="text-muted-foreground">{plan.description}</p>
                    )}
                  </Card>

                  <div className="space-y-4">
                    {items
                      .filter((item) => item.care_plan_id === plan.id)
                      .map((item) => (
                        <Card key={item.id} className="p-5">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={item.completed_today}
                              onCheckedChange={() =>
                                handleToggleItem(item.id, item.completed_today)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-primary">{getItemIcon(item.item_type)}</div>
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <Badge variant="secondary" className="capitalize">
                                  {item.item_type}
                                </Badge>
                              </div>
                              {item.description && (
                                <p className="text-muted-foreground mb-2">{item.description}</p>
                              )}
                              {item.frequency && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Frequency:</strong> {item.frequency}
                                </p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}

              <div className="bg-muted/50 rounded-lg p-6 mt-8">
                <h3 className="font-semibold mb-2">Track Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Check off items as you complete them each day. Your progress helps your healthcare
                  provider understand how well your treatment plan is working.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CarePlan;
