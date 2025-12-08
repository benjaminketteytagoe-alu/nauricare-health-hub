-- Allow patients to update their own appointments (for cancellation)
CREATE POLICY "Patients can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (user_has_patient_profile(auth.uid(), patient_id))
WITH CHECK (user_has_patient_profile(auth.uid(), patient_id));