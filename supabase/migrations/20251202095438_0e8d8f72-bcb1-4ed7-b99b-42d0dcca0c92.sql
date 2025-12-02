-- Fix infinite recursion in RLS policies by using security definer functions

-- Create helper function to check if user owns a patient profile (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_has_patient_profile(_user_id UUID, _patient_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_profiles
    WHERE id = _patient_id AND user_id = _user_id
  )
$$;

-- Create helper function to check if user owns a clinician profile (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_has_clinician_profile(_user_id UUID, _clinician_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinician_profiles
    WHERE id = _clinician_id AND user_id = _user_id
  )
$$;

-- Drop and recreate appointments policies to avoid recursion
DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clinicians can view their appointments" ON public.appointments;

CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (public.user_has_patient_profile(auth.uid(), patient_id));

CREATE POLICY "Patients can create their own appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (public.user_has_patient_profile(auth.uid(), patient_id));

CREATE POLICY "Clinicians can view their appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (public.user_has_clinician_profile(auth.uid(), clinician_id));

-- Add missing user role for existing user (if not exists)
INSERT INTO public.user_roles (user_id, role)
VALUES ('a089b14d-6dda-4878-a44e-1d9229733f88'::uuid, 'patient'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;