-- Drop foreign key constraints to allow demo data without auth users
ALTER TABLE public.clinician_profiles 
DROP CONSTRAINT IF EXISTS clinician_profiles_user_id_fkey;

ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert demo clinician profiles with varied specialties and locations
INSERT INTO public.clinician_profiles (
  id,
  user_id,
  full_name,
  specialty,
  bio,
  location,
  country,
  avatar_url,
  telehealth_available,
  fee_range_min,
  fee_range_max,
  languages
) VALUES
  (
    gen_random_uuid(),
    'a1111111-1111-1111-1111-111111111111'::uuid,
    'Dr. Aline Uwase',
    'Gynecologist',
    'Specialized in women''s reproductive health with over 12 years of experience. Expertise in PCOS, endometriosis, and fertility treatments.',
    'Kigali City',
    'Rwanda',
    NULL,
    true,
    30000,
    50000,
    ARRAY['English', 'Kinyarwanda', 'French']
  ),
  (
    gen_random_uuid(),
    'a2222222-2222-2222-2222-222222222222'::uuid,
    'Dr. Marie Mukamana',
    'Reproductive Endocrinologist',
    'Board-certified specialist in hormonal disorders and fertility. Focused on PCOS management and assisted reproductive technologies.',
    'Kigali City',
    'Rwanda',
    NULL,
    true,
    40000,
    70000,
    ARRAY['English', 'Kinyarwanda']
  ),
  (
    gen_random_uuid(),
    'a3333333-3333-3333-3333-333333333333'::uuid,
    'Dr. Jean Claude Niyonzima',
    'Fertility Specialist',
    'Dedicated to helping couples achieve their dream of parenthood. Specializes in IVF, IUI, and fertility preservation.',
    'Butare',
    'Rwanda',
    NULL,
    true,
    35000,
    60000,
    ARRAY['English', 'Kinyarwanda', 'French']
  ),
  (
    gen_random_uuid(),
    'a4444444-4444-4444-4444-444444444444'::uuid,
    'Dr. Grace Umutoni',
    'PCOS Specialist',
    'Expert in Polycystic Ovary Syndrome management with a holistic approach including lifestyle, nutrition, and medical interventions.',
    'Kigali City',
    'Rwanda',
    NULL,
    true,
    25000,
    45000,
    ARRAY['English', 'Kinyarwanda']
  ),
  (
    gen_random_uuid(),
    'a5555555-5555-5555-5555-555555555555'::uuid,
    'Dr. Patrick Habimana',
    'Obstetrician & Gynecologist',
    'Comprehensive women''s healthcare including prenatal care, high-risk pregnancies, and gynecological surgery.',
    'Gisenyi',
    'Rwanda',
    NULL,
    false,
    30000,
    55000,
    ARRAY['English', 'Kinyarwanda', 'French']
  ),
  (
    gen_random_uuid(),
    'a6666666-6666-6666-6666-666666666666'::uuid,
    'Dr. Sarah Ingabire',
    'Women''s Health Specialist',
    'Focuses on preventive care, menstrual disorders, and menopausal health. Telehealth consultations available nationwide.',
    'Ruhengeri',
    'Rwanda',
    NULL,
    true,
    20000,
    40000,
    ARRAY['English', 'Kinyarwanda']
  );

-- Assign clinician roles to demo users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('a1111111-1111-1111-1111-111111111111'::uuid, 'clinician'::app_role),
  ('a2222222-2222-2222-2222-222222222222'::uuid, 'clinician'::app_role),
  ('a3333333-3333-3333-3333-333333333333'::uuid, 'clinician'::app_role),
  ('a4444444-4444-4444-4444-444444444444'::uuid, 'clinician'::app_role),
  ('a5555555-5555-5555-5555-555555555555'::uuid, 'clinician'::app_role),
  ('a6666666-6666-6666-6666-666666666666'::uuid, 'clinician'::app_role);