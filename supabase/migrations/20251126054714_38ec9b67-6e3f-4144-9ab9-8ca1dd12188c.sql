-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'clinician', 'patient');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  country TEXT DEFAULT 'Rwanda',
  language TEXT DEFAULT 'English',
  menstrual_status TEXT,
  diagnosed_pcos BOOLEAN DEFAULT false,
  diagnosed_fibroids BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Clinician profiles table
CREATE TABLE public.clinician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  country TEXT DEFAULT 'Rwanda',
  languages TEXT[] DEFAULT ARRAY['English'],
  telehealth_available BOOLEAN DEFAULT true,
  fee_range_min INTEGER,
  fee_range_max INTEGER,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clinician_profiles ENABLE ROW LEVEL SECURITY;

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  clinician_id UUID REFERENCES public.clinician_profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('in-person', 'telehealth')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Symptom checks table
CREATE TABLE public.symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  symptoms JSONB NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;

-- Care plans table
CREATE TABLE public.care_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.care_plans ENABLE ROW LEVEL SECURITY;

-- Care plan items table
CREATE TABLE public.care_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id UUID REFERENCES public.care_plans(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('medication', 'lifestyle', 'appointment', 'exercise', 'diet')),
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  completed_today BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.care_plan_items ENABLE ROW LEVEL SECURITY;

-- Educational articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  language TEXT DEFAULT 'English',
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patient_profiles
CREATE POLICY "Patients can view their own profile"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can update their own profile"
  ON public.patient_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own profile"
  ON public.patient_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clinicians can view patient profiles they have appointments with"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'clinician') AND
    EXISTS (
      SELECT 1 FROM public.appointments a
      INNER JOIN public.clinician_profiles cp ON a.clinician_id = cp.id
      WHERE cp.user_id = auth.uid() AND a.patient_id = public.patient_profiles.id
    )
  );

CREATE POLICY "Admins can view all patient profiles"
  ON public.patient_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for clinician_profiles
CREATE POLICY "Everyone can view clinician profiles"
  ON public.clinician_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clinicians can update their own profile"
  ON public.clinician_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can insert their own profile"
  ON public.clinician_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all clinician profiles"
  ON public.clinician_profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for appointments
CREATE POLICY "Patients can view their own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = patient_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their own appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = patient_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view their appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clinician_profiles cp
      WHERE cp.id = clinician_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for symptom_checks
CREATE POLICY "Patients can view their own symptom checks"
  ON public.symptom_checks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = patient_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their own symptom checks"
  ON public.symptom_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = patient_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all symptom checks"
  ON public.symptom_checks FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for care_plans
CREATE POLICY "Patients can view their own care plans"
  ON public.care_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = patient_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view care plans for their patients"
  ON public.care_plans FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'clinician') AND
    EXISTS (
      SELECT 1 FROM public.appointments a
      INNER JOIN public.clinician_profiles cp ON a.clinician_id = cp.id
      WHERE cp.user_id = auth.uid() AND a.patient_id = public.care_plans.patient_id
    )
  );

CREATE POLICY "Clinicians can create care plans for their patients"
  ON public.care_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'clinician') AND
    EXISTS (
      SELECT 1 FROM public.appointments a
      INNER JOIN public.clinician_profiles cp ON a.clinician_id = cp.id
      WHERE cp.user_id = auth.uid() AND a.patient_id = public.care_plans.patient_id
    )
  );

-- RLS Policies for care_plan_items
CREATE POLICY "Users can view care plan items for their care plans"
  ON public.care_plan_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_plans cp
      INNER JOIN public.patient_profiles pp ON cp.patient_id = pp.id
      WHERE cp.id = care_plan_id AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update their own care plan items"
  ON public.care_plan_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_plans cp
      INNER JOIN public.patient_profiles pp ON cp.patient_id = pp.id
      WHERE cp.id = care_plan_id AND pp.user_id = auth.uid()
    )
  );

-- RLS Policies for articles
CREATE POLICY "Everyone can view published articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all articles"
  ON public.articles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clinician_profiles_updated_at
  BEFORE UPDATE ON public.clinician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_care_plans_updated_at
  BEFORE UPDATE ON public.care_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();