import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Onboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    country: "Rwanda",
    language: "English",
    menstrualStatus: "",
    diagnosedPcos: false,
    diagnosedFibroids: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const { error: profileError } = await supabase
        .from("patient_profiles")
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          country: formData.country,
          language: formData.language,
          menstrual_status: formData.menstrualStatus,
          diagnosed_pcos: formData.diagnosedPcos,
          diagnosed_fibroids: formData.diagnosedFibroids,
        });

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "patient",
        });

      if (roleError) throw roleError;

      toast({
        title: "Profile Created!",
        description: "Welcome to NauriCare. Let's explore your dashboard.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Let's get to know you</h2>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Burundi">Burundi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                  <SelectItem value="Swahili">Swahili</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setStep(2)} className="w-full h-12" disabled={!formData.fullName}>
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Health Information</h2>
              <p className="text-muted-foreground">
                This information helps us provide better support (optional but recommended)
              </p>
            </div>

            <div className="space-y-4">
              <Label>Have you been diagnosed with PCOS or fibroids?</Label>
              <RadioGroup
                value={
                  formData.diagnosedPcos && formData.diagnosedFibroids
                    ? "both"
                    : formData.diagnosedPcos
                    ? "pcos"
                    : formData.diagnosedFibroids
                    ? "fibroids"
                    : "neither"
                }
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    diagnosedPcos: value === "pcos" || value === "both",
                    diagnosedFibroids: value === "fibroids" || value === "both",
                  });
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pcos" id="pcos" />
                  <Label htmlFor="pcos" className="font-normal cursor-pointer">
                    Yes, PCOS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fibroids" id="fibroids" />
                  <Label htmlFor="fibroids" className="font-normal cursor-pointer">
                    Yes, fibroids
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="font-normal cursor-pointer">
                    Yes, both
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neither" id="neither" />
                  <Label htmlFor="neither" className="font-normal cursor-pointer">
                    Not yet diagnosed
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menstrualStatus">Menstrual Status</Label>
              <Select value={formData.menstrualStatus} onValueChange={(value) => setFormData({ ...formData, menstrualStatus: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular periods</SelectItem>
                  <SelectItem value="irregular">Irregular periods</SelectItem>
                  <SelectItem value="absent">Absent periods (amenorrhea)</SelectItem>
                  <SelectItem value="menopause">Menopause</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 h-12">
                Complete Setup
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              You can update this information anytime in your profile settings
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl p-8 animate-fade-in">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
