import { useState } from "react";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Clock, Video, MapPin, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialist: {
    id: string;
    full_name: string;
    specialty: string;
    telehealth_available: boolean;
  };
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export function BookingDialog({ open, onOpenChange, specialist }: BookingDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [mode, setMode] = useState<string>("in-person");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const { toast } = useToast();

  const handleBooking = async () => {
    if (!date || !time) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user and their patient profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to book an appointment.",
          variant: "destructive",
        });
        return;
      }

      const { data: patientProfile, error: profileError } = await supabase
        .from("patient_profiles")
        .select("id, full_name")
        .eq("user_id", user.id)
        .single();

      if (profileError || !patientProfile) {
        toast({
          title: "Profile required",
          description: "Please complete your profile before booking.",
          variant: "destructive",
        });
        return;
      }

      // Create appointment datetime
      const [hours, minutes] = time.split(":").map(Number);
      const appointmentDate = setMinutes(setHours(date, hours), minutes);

      // Insert appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          patient_id: patientProfile.id,
          clinician_id: specialist.id,
          appointment_datetime: appointmentDate.toISOString(),
          mode: mode,
          notes: notes || null,
          status: "scheduled",
        })
        .select()
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      // Send notification emails via edge function
      try {
        await supabase.functions.invoke("send-appointment-notification", {
          body: {
            appointmentId: appointment.id,
            patientName: patientProfile.full_name,
            patientEmail: user.email,
            specialistName: specialist.full_name,
            specialistId: specialist.id,
            appointmentDateTime: appointmentDate.toISOString(),
            mode: mode,
            notes: notes,
          },
        });
      } catch (notificationError) {
        console.log("Notification sending failed, but appointment was created");
      }

      setAppointmentDetails({
        ...appointment,
        patientName: patientProfile.full_name,
        specialistName: specialist.full_name,
        appointmentDateTime: appointmentDate,
      });
      setBookingComplete(true);

      toast({
        title: "Appointment booked!",
        description: `Your appointment with ${specialist.full_name} is confirmed.`,
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Could not book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateICSFile = () => {
    if (!appointmentDetails) return;

    const startDate = new Date(appointmentDetails.appointmentDateTime);
    const endDate = addHours(startDate, 1);

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NauriCare//Appointment//EN
BEGIN:VEVENT
UID:${appointmentDetails.id}@nauricare.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Appointment with ${appointmentDetails.specialistName}
DESCRIPTION:${mode === "telehealth" ? "Telehealth" : "In-person"} consultation${notes ? `\\nNotes: ${notes}` : ""}
LOCATION:${mode === "telehealth" ? "Video Call via NauriCare" : "Clinic Location"}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointment-${format(startDate, "yyyy-MM-dd")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setDate(undefined);
    setTime("");
    setMode("in-person");
    setNotes("");
    setBookingComplete(false);
    setAppointmentDetails(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookingComplete ? "Appointment Confirmed!" : `Book Appointment with ${specialist.full_name}`}
          </DialogTitle>
          <DialogDescription>
            {bookingComplete
              ? "Your appointment has been scheduled. Add it to your calendar below."
              : `${specialist.specialty} - Select your preferred date and time`}
          </DialogDescription>
        </DialogHeader>

        {bookingComplete ? (
          <div className="space-y-6 py-4">
            <div className="rounded-lg bg-primary/10 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {format(appointmentDetails.appointmentDateTime, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span>{format(appointmentDetails.appointmentDateTime, "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-3">
                {mode === "telehealth" ? (
                  <Video className="w-5 h-5 text-primary" />
                ) : (
                  <MapPin className="w-5 h-5 text-primary" />
                )}
                <span>{mode === "telehealth" ? "Video Call" : "In-person visit"}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={generateICSFile} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Add to Calendar (.ics)
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="flex justify-center border rounded-lg p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className={cn("p-3 pointer-events-auto")}
                />
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label>Select Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {format(setMinutes(setHours(new Date(), parseInt(slot.split(":")[0])), parseInt(slot.split(":")[1])), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment Mode */}
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      In-person Visit
                    </div>
                  </SelectItem>
                  {specialist.telehealth_available && (
                    <SelectItem value="telehealth">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Call
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes (optional)</Label>
              <Textarea
                placeholder="Describe your symptoms or reason for visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBooking}
              disabled={!date || !time || loading}
              className="w-full"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
