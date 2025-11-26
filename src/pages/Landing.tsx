import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, Users, Smartphone } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-block mb-6">
            <Heart className="w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            NauriCare
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
            Dignified care for PCOS, fibroids, and women's health across Africa
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            We provide warm, privacy-first healthcare support for women managing reproductive health conditions. 
            Connect with specialists, track symptoms, and access care on your terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/auth")}
            >
              Create Free Account
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Log In
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How NauriCare Supports You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Heart className="w-10 h-10" />}
            title="Symptom Checker"
            description="Confidential PCOS & fibroid symptom tracking with personalized guidance"
          />
          <FeatureCard
            icon={<Users className="w-10 h-10" />}
            title="Specialist Network"
            description="Connect with verified gynecologists and health workers across East Africa"
          />
          <FeatureCard
            icon={<Shield className="w-10 h-10" />}
            title="Privacy First"
            description="Your health data is protected with industry-leading security standards"
          />
          <FeatureCard
            icon={<Smartphone className="w-10 h-10" />}
            title="USSD Access"
            description="Low-data access via mobile phones for rural and remote areas"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-8">Who NauriCare Is For</h2>
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p className="text-center text-lg mb-6">
              NauriCare is built for women across Africa who are managing PCOS, fibroids, or related 
              reproductive health challenges. We understand the stigma, the questions, and the need for 
              dignified, judgment-free care.
            </p>
            <p className="text-center text-lg">
              Whether you're in Kigali, Nairobi, or a rural village, NauriCare brings quality 
              healthcare information and connections to your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of women across Africa who trust NauriCare for their reproductive health needs.
        </p>
        <Button 
          size="lg" 
          className="text-lg px-12 py-6"
          onClick={() => navigate("/auth")}
        >
          Get Started Free
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-4">© 2024 NauriCare. All rights reserved.</p>
          <p className="text-sm">
            NauriCare does not replace professional medical advice. Always consult with a healthcare provider.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-all">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
