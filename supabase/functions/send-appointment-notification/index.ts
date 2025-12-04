import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

async function sendEmail(to: string, subject: string, html: string, attachments?: Array<{ filename: string; content: string }>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "NauriCare <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      attachments,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
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

    // Generate ICS content for calendar attachment
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

    // Base64 encode ICS content
    const icsBase64 = btoa(icsContent);

    // Email HTML templates
    const patientEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f5a462 0%, #e8916d 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
            .appointment-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; align-items: center; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${patientName},</p>
              <p>Your appointment has been successfully booked with <strong>${specialistName}</strong>.</p>
              
              <div class="appointment-card">
                <h3 style="margin-top: 0;">Appointment Details</h3>
                <div class="detail-row">
                  <span>📅</span>&nbsp;<strong>${formattedDate}</strong>
                </div>
                <div class="detail-row">
                  <span>🕐</span>&nbsp;<strong>${formattedTime}</strong>
                </div>
                <div class="detail-row">
                  <span>${mode === "telehealth" ? "📹" : "📍"}</span>&nbsp;
                  <strong>${mode === "telehealth" ? "Video Call" : "In-person Visit"}</strong>
                </div>
                ${notes ? `<div class="detail-row"><span>📝</span>&nbsp;${notes}</div>` : ""}
              </div>
              
              ${mode === "telehealth" ? `<p>You'll receive a video call link before your appointment. Make sure you're in a quiet place with a stable internet connection.</p>` : `<p>Please arrive 10 minutes before your scheduled time.</p>`}
              
              <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
              
              <div class="footer">
                <p>Thank you for choosing NauriCare</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const clinicianEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b8a7a 0%, #5a7a6a 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px; }
            .appointment-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; align-items: center; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Appointment Scheduled</h1>
            </div>
            <div class="content">
              <p>Dear ${specialistName},</p>
              <p>You have a new appointment scheduled with <strong>${patientName}</strong>.</p>
              
              <div class="appointment-card">
                <h3 style="margin-top: 0;">Appointment Details</h3>
                <div class="detail-row">
                  <span>👤</span>&nbsp;<strong>Patient:</strong>&nbsp;${patientName}
                </div>
                <div class="detail-row">
                  <span>📅</span>&nbsp;<strong>${formattedDate}</strong>
                </div>
                <div class="detail-row">
                  <span>🕐</span>&nbsp;<strong>${formattedTime}</strong>
                </div>
                <div class="detail-row">
                  <span>${mode === "telehealth" ? "📹" : "📍"}</span>&nbsp;
                  <strong>${mode === "telehealth" ? "Video Call" : "In-person Visit"}</strong>
                </div>
                ${notes ? `<div class="detail-row"><span>📝</span>&nbsp;<strong>Patient Notes:</strong>&nbsp;${notes}</div>` : ""}
              </div>
              
              <div class="footer">
                <p>NauriCare Clinician Portal</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResults = [];

    // Send email to patient
    try {
      const patientEmailResult = await sendEmail(
        patientEmail,
        `✅ Appointment Confirmed with ${specialistName}`,
        patientEmailHtml,
        [{ filename: `appointment-${appointmentId}.ics`, content: icsBase64 }]
      );
      console.log("Patient email sent:", patientEmailResult);
      emailResults.push({ recipient: "patient", success: true, result: patientEmailResult });
    } catch (emailError: any) {
      console.error("Failed to send patient email:", emailError);
      emailResults.push({ recipient: "patient", success: false, error: emailError.message });
    }

    // Send email to clinician if we have their email
    if (clinicianEmail) {
      try {
        const clinicianEmailResult = await sendEmail(
          clinicianEmail,
          `📅 New Appointment: ${patientName}`,
          clinicianEmailHtml,
          [{ filename: `appointment-${appointmentId}.ics`, content: icsBase64 }]
        );
        console.log("Clinician email sent:", clinicianEmailResult);
        emailResults.push({ recipient: "clinician", success: true, result: clinicianEmailResult });
      } catch (emailError: any) {
        console.error("Failed to send clinician email:", emailError);
        emailResults.push({ recipient: "clinician", success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification emails processed",
        emailResults,
        appointment: {
          id: appointmentId,
          date: formattedDate,
          time: formattedTime,
          mode,
        },
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
