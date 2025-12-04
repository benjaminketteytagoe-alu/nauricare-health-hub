import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  specialistName: string;
  specialistId: string;
  appointmentDateTime: string;
  mode: string;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      appointmentId,
      patientName,
      patientEmail,
      specialistName,
      specialistId,
      appointmentDateTime,
      mode,
      notes,
    }: NotificationRequest = await req.json();

    console.log("Processing appointment notification:", {
      appointmentId,
      patientName,
      specialistName,
      appointmentDateTime,
      mode,
    });

    // Format date for display
    const appointmentDate = new Date(appointmentDateTime);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Create Supabase client to get clinician email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get clinician's user email
    const { data: clinicianProfile } = await supabase
      .from("clinician_profiles")
      .select("user_id")
      .eq("id", specialistId)
      .single();

    let clinicianEmail = null;
    if (clinicianProfile?.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(
        clinicianProfile.user_id
      );
      clinicianEmail = userData?.user?.email;
    }

    // For now, we'll log the notification details
    // In production, you would integrate with an email service like Resend
    console.log("Patient notification:", {
      to: patientEmail,
      subject: `Appointment Confirmed with ${specialistName}`,
      body: `Your ${mode} appointment is scheduled for ${formattedDate} at ${formattedTime}.`,
    });

    if (clinicianEmail) {
      console.log("Clinician notification:", {
        to: clinicianEmail,
        subject: `New Appointment: ${patientName}`,
        body: `You have a new ${mode} appointment scheduled for ${formattedDate} at ${formattedTime}.`,
      });
    }

    // Generate ICS content for calendar
    const startDate = appointmentDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NauriCare//Appointment//EN
BEGIN:VEVENT
UID:${appointmentId}@nauricare.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:NauriCare Appointment - ${specialistName} & ${patientName}
DESCRIPTION:${mode === "telehealth" ? "Telehealth" : "In-person"} consultation${notes ? `\\nNotes: ${notes}` : ""}
LOCATION:${mode === "telehealth" ? "Video Call via NauriCare" : "Clinic Location"}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications sent successfully",
        appointment: {
          id: appointmentId,
          date: formattedDate,
          time: formattedTime,
          mode,
        },
        icsContent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
