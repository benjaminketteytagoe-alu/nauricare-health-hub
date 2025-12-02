import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, AlertCircle, ArrowLeft, Info } from "lucide-react";

const symptoms = [
  "Irregular or absent periods",
  "Heavy menstrual bleeding",
  "Severe pelvic pain",
  "Lower back pain",
  "Pain during intercourse",
  "Frequent urination",
  "Unexplained weight gain",
  "Excessive hair growth (face, chest)",
  "Acne or oily skin",
  "Difficulty getting pregnant",
];

const SymptomChecker = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [result, setResult] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const calculateRiskLevel = () => {
    const severityScore = severity === "severe" ? 3 : severity === "moderate" ? 2 : 1;
    const symptomCount = selectedSymptoms.length;
    const durationScore = duration === "more-than-6" ? 3 : duration === "3-6" ? 2 : 1;

    const totalScore = severityScore + symptomCount + durationScore;

    if (totalScore >= 10) return "high";
    if (totalScore >= 6) return "moderate";
    return "low";
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your symptom check.",
        variant: "destructive",
      });
      return;
    }

    const riskLevel = calculateRiskLevel();
    setResult({ riskLevel });
    setStep(3);
    setIsAnalyzing(true);

    try {
      // Get profile first
      const { data: profileData } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profileData) {
        toast({
          title: "Profile Required",
          description: "Please complete your profile first.",
          variant: "destructive",
        });
        navigate("/onboarding");
        return;
      }

      // Get AI analysis
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-symptoms', {
        body: { 
          symptoms: selectedSymptoms, 
          duration, 
          severity 
        }
      });

      if (aiError) {
        console.error("AI analysis error:", aiError);
        setAiAnalysis("We're unable to provide AI insights at this time, but based on your symptoms, we recommend consulting with a healthcare specialist for personalized guidance.");
      } else {
        setAiAnalysis(aiData.analysis);
      }

      // Save to database
      await supabase.from("symptom_checks").insert({
        patient_id: profileData.id,
        symptoms: {
          selected: selectedSymptoms,
          duration,
          severity,
        },
        risk_level: riskLevel,
      });

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to process symptom check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select Your Symptoms</h2>
              <p className="text-muted-foreground">
                Check all symptoms you've been experiencing
              </p>
            </div>

            <div className="space-y-3">
              {symptoms.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={symptom} className="flex-1 cursor-pointer font-normal">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full h-12"
              disabled={selectedSymptoms.length === 0}
            >
              Continue
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Symptom Details</h2>
              <p className="text-muted-foreground">
                Help us understand your experience better
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base mb-3 block">How long have you had these symptoms?</Label>
                <RadioGroup value={duration} onValueChange={setDuration}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="less-than-3" id="less-than-3" />
                    <Label htmlFor="less-than-3" className="font-normal cursor-pointer">
                      Less than 3 months
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3-6" id="3-6" />
                    <Label htmlFor="3-6" className="font-normal cursor-pointer">
                      3-6 months
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="more-than-6" id="more-than-6" />
                    <Label htmlFor="more-than-6" className="font-normal cursor-pointer">
                      More than 6 months
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base mb-3 block">How severe are your symptoms?</Label>
                <RadioGroup value={severity} onValueChange={setSeverity}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mild" id="mild" />
                    <Label htmlFor="mild" className="font-normal cursor-pointer">
                      Mild - Noticeable but manageable
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="font-normal cursor-pointer">
                      Moderate - Affecting daily activities
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="severe" id="severe" />
                    <Label htmlFor="severe" className="font-normal cursor-pointer">
                      Severe - Significantly impacting life
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-12"
                disabled={!duration || !severity}
              >
                Get Results
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`inline-block p-4 rounded-full mb-4 ${
                result?.riskLevel === "high" ? "bg-destructive/10" :
                result?.riskLevel === "moderate" ? "bg-primary/10" :
                "bg-secondary/10"
              }`}>
                <AlertCircle className={`w-12 h-12 ${
                  result?.riskLevel === "high" ? "text-destructive" :
                  result?.riskLevel === "moderate" ? "text-primary" :
                  "text-secondary"
                }`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {result?.riskLevel === "high" && "High Concern Level"}
                {result?.riskLevel === "moderate" && "Moderate Concern Level"}
                {result?.riskLevel === "low" && "Low Concern Level"}
              </h2>
            </div>

            {isAnalyzing ? (
              <Card className="p-6 bg-muted/50">
                <div className="flex items-center justify-center gap-3 py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Getting AI-powered health insights...</p>
                </div>
              </Card>
            ) : aiAnalysis && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <h3 className="font-semibold text-lg">AI Health Insights</h3>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {aiAnalysis}
                </p>
              </Card>
            )}

            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold mb-3">What this means:</h3>
              <p className="text-muted-foreground mb-4">
                {result?.riskLevel === "high" &&
                  "Your symptoms suggest you should consult with a healthcare provider soon. We recommend booking an appointment with a specialist who can provide proper evaluation and treatment."}
                {result?.riskLevel === "moderate" &&
                  "Your symptoms indicate it would be beneficial to speak with a healthcare provider. Consider booking an appointment to discuss your concerns and explore treatment options."}
                {result?.riskLevel === "low" &&
                  "While your symptoms appear mild, it's still important to monitor them. If symptoms persist or worsen, please consult with a healthcare provider."}
              </p>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Medical Disclaimer:</strong> NauriCare does not provide medical diagnosis or replace
                professional medical advice. This tool is for informational purposes only. Always consult with a
                qualified healthcare provider for proper diagnosis and treatment.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={() => navigate("/specialists")} className="w-full h-12">
                Book a Specialist Visit
              </Button>
              <Button variant="outline" onClick={() => navigate("/learn")} className="w-full h-12">
                Learn More About PCOS & Fibroids
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep(1);
                  setSelectedSymptoms([]);
                  setDuration("");
                  setSeverity("");
                  setResult(null);
                  setAiAnalysis(null);
                }} 
                className="w-full"
              >
                Check Symptoms Again
              </Button>
            </div>
          </div>
        );
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
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Symptom Checker</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex gap-2 mb-6">
              <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              <div className={`h-2 flex-1 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>

          <Card className="p-8 animate-fade-in">{renderStep()}</Card>
        </div>
      </main>
    </div>
  );
};

export default SymptomChecker;
