-- Allow users to insert their own patient role during onboarding
CREATE POLICY "Users can insert their own patient role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'patient'::app_role
);