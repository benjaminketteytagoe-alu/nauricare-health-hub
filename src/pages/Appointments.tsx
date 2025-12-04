import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  X,
  CalendarCheck,
  CalendarX,
} from "lucide-react";

interface Appointment {
  id: string;
  appointment_datetime: string;
  mode: string;
  notes: string | null;
  status: string | null;
  clinician_profiles: {
    id: string;
    full_name: string;
    specialty: string;
    telehealth_available: boolean;
  };
}

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get patient profile
      const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!patientProfile) {
        setLoading(false);
        return;
      }

      // Fetch appointments with clinician details
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_datetime,
          mode,
          notes,
          status,
          clinician_profiles (
            id,
            full_name,
            specialty,
            telehealth_available
          )
        `)
        .eq("patient_id", patientProfile.id)
        .order("appointment_datetime", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Could not load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelingId) return;

    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", cancelingId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === cancelingId ? { ...apt, status: "cancelled" } : apt
        )
      );

      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    } catch (error: any) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Could not cancel appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelingId(null);
      setShowCancelDialog(false);
    }
  };

  const getStatusBadge = (status: string | null, datetime: string) => {
    const appointmentDate = new Date(datetime);
    
    if (status === "cancelled") {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (status === "completed") {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (isPast(appointmentDate) && !isToday(appointmentDate)) {
      return <Badge variant="secondary">Past</Badge>;
    }
    if (isToday(appointmentDate)) {
      return <Badge className="bg-primary">Today</Badge>;
    }
    return <Badge variant="outline" className="border-primary text-primary">Upcoming</Badge>;
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.status !== "cancelled" &&
      apt.status !== "completed" &&
      !isPast(new Date(apt.appointment_datetime))
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      apt.status === "completed" ||
      (apt.status !== "cancelled" && isPast(new Date(apt.appointment_datetime)))
  );

  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled"
  );

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.appointment_datetime);
    const canCancel =
      appointment.status !== "cancelled" &&
      appointment.status !== "completed" &&
      !isPast(appointmentDate);

    return (
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date/Time Column */}
          <div className="flex-shrink-0 text-center sm:text-left">
            <div className="bg-primary/10 rounded-lg p-3 inline-block">
              <div className="text-2xl font-bold text-primary">
                {format(appointmentDate, "d")}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(appointmentDate, "MMM")}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.clinician_profiles.full_name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {appointment.clinician_profiles.specialty}
                </p>
              </div>
              {getStatusBadge(appointment.status, appointment.appointment_datetime)}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {format(appointmentDate, "h:mm a")}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {appointment.mode === "telehealth" ? (
                  <>
                    <Video className="w-4 h-4" />
                    Video Call
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    In-person
                  </>
                )}
              </div>
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {appointment.notes}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {appointment.mode === "telehealth" &&
                canCancel &&
                isToday(appointmentDate) && (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/video-call/${appointment.clinician_profiles.id}`, {
                        state: { specialistName: appointment.clinician_profiles.full_name },
                      })
                    }
                    className="gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Join Call
                  </Button>
                )}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCancelingId(appointment.id);
                    setShowCancelDialog(true);
                  }}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading appointments...</div>
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
            <h1 className="text-2xl font-bold">My Appointments</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {appointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't booked any appointments. Find a specialist to get started.
              </p>
              <Button onClick={() => navigate("/specialists")}>
                Find a Specialist
              </Button>
            </Card>
          ) : (
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming" className="gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Past ({pastAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="gap-2">
                  <CalendarX className="w-4 h-4" />
                  Cancelled ({cancelledAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button variant="outline" onClick={() => navigate("/specialists")}>
                      Book an Appointment
                    </Button>
                  </Card>
                ) : (
                  upcomingAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastAppointments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No past appointments</p>
                  </Card>
                ) : (
                  pastAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {cancelledAppointments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No cancelled appointments</p>
                  </Card>
                ) : (
                  cancelledAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              Please cancel at least 24 hours in advance when possible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelingId(null)}>
              Keep Appointment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Appointments;
