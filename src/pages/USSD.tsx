import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft, Smartphone, Signal, Check } from "lucide-react";

const USSD = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <header className="bg-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">USSD Access</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Smartphone className="w-20 h-20 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Healthcare Without Internet</h2>
            <p className="text-xl text-muted-foreground">
              Access NauriCare services on any mobile phone, even without internet connection
            </p>
          </div>

          <Card className="p-8 mb-8 text-center bg-primary/5 border-primary/20">
            <div className="inline-block bg-card px-8 py-6 rounded-2xl shadow-md mb-4">
              <p className="text-4xl font-bold text-primary">*789*678#</p>
            </div>
            <p className="text-lg text-muted-foreground">
              Dial this code from your mobile phone to access NauriCare
            </p>
          </Card>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">What You Can Do via USSD</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureItem
                icon={<Check className="w-5 h-5" />}
                title="Basic Symptom Check"
                description="Answer simple questions about your symptoms"
              />
              <FeatureItem
                icon={<Check className="w-5 h-5" />}
                title="Health Tips"
                description="Receive daily health tips and reminders"
              />
              <FeatureItem
                icon={<Check className="w-5 h-5" />}
                title="Clinic Referrals"
                description="Find nearby health facilities"
              />
              <FeatureItem
                icon={<Check className="w-5 h-5" />}
                title="Appointment Info"
                description="Check your upcoming appointments"
              />
            </div>
          </div>

          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Signal className="w-6 h-6 text-primary" />
              Why USSD Matters
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">No Internet Required:</strong> USSD works on any mobile 
                phone, even basic feature phones.
              </p>
              <p>
                <strong className="text-foreground">Low Cost:</strong> USSD sessions use minimal airtime, 
                making healthcare accessible to everyone.
              </p>
              <p>
                <strong className="text-foreground">Rural Accessibility:</strong> Reach NauriCare services 
                even in areas with poor internet connectivity.
              </p>
              <p>
                <strong className="text-foreground">Quick & Simple:</strong> Navigate menus easily with 
                your phone's number pad.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h3 className="text-lg font-semibold mb-2 text-amber-900 dark:text-amber-100">
              Coming Soon
            </h3>
            <p className="text-amber-900 dark:text-amber-100">
              We're currently finalizing our USSD service with mobile network operators across East Africa. 
              The service will launch soon in Rwanda, Kenya, Uganda, and Tanzania. Check back for updates!
            </p>
          </Card>

          <div className="text-center mt-8">
            <Button onClick={() => navigate("/dashboard")} size="lg">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
    <div className="text-primary mt-1">{icon}</div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default USSD;
