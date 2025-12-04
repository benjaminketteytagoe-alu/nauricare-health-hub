import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ArrowLeft, MapPin, Video, User } from "lucide-react";
import PharmacySearch from "@/components/PharmacySearch";
import { BookingDialog } from "@/components/BookingDialog";


const Specialists = () => {
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialist, setSelectedSpecialist] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    const { data, error } = await supabase
      .from("clinician_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setSpecialists(data);
    }
    setLoading(false);
  };

  const handleTelehealthCall = (specialistId: string, specialistName: string) => {
    navigate(`/video-call/${specialistId}`, { state: { specialistName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading specialists...</div>
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
            <h1 className="text-2xl font-bold">Find a Specialist</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Connect with Verified Clinicians</h2>
            <p className="text-lg text-muted-foreground">
              Book appointments with gynecologists and health workers specializing in PCOS and fibroids
            </p>
            <Badge variant="secondary" className="mt-2">
              Consultation fees: RWF 3,500 - RWF 6,000
            </Badge>
          </div>

          {specialists.length === 0 ? (
            <Card className="p-12 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Specialists Yet</h3>
              <p className="text-muted-foreground mb-6">
                We're currently onboarding specialists to serve you better. Check back soon!
              </p>
              <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {specialists.map((specialist) => (
                <Card key={specialist.id} className="p-6 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{specialist.full_name}</h3>
                          <p className="text-lg text-muted-foreground">{specialist.specialty}</p>
                        </div>
                        <Badge variant="secondary" className="text-base px-4 py-2">
                          RWF 3,500 - RWF 6,000
                        </Badge>
                      </div>

                      {specialist.bio && (
                        <p className="text-muted-foreground mb-4">{specialist.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{specialist.location}, {specialist.country}</span>
                        </div>
                        {specialist.telehealth_available && (
                          <div className="flex items-center gap-2 text-primary">
                            <Video className="w-4 h-4" />
                            <span>Telehealth Available</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {specialist.languages?.map((lang: string) => (
                          <Badge key={lang} variant="outline">
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => {
                            setSelectedSpecialist(specialist);
                            setBookingOpen(true);
                          }}
                        >
                          Book Appointment
                        </Button>
                        {specialist.telehealth_available && (
                          <Button
                            variant="outline"
                            onClick={() => handleTelehealthCall(specialist.id, specialist.full_name)}
                            className="gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Start Video Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Partner Pharmacies Section */}
          <PharmacySearch />
        </div>
      </main>

      {/* Booking Dialog */}
      {selectedSpecialist && (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          specialist={selectedSpecialist}
        />
      )}
    </div>
  );
};

export default Specialists;
