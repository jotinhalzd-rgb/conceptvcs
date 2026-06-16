
-- Fix: infinite recursion in RLS policy "Users can view profiles in their organization"
-- The policy subquery referenced public.profiles itself, triggering recursion when
-- PostgREST evaluated the policy. Replace with a SECURITY DEFINER helper.

CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id() TO service_role;

DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

CREATE POLICY "Users can view profiles in their organization"
ON public.profiles
FOR SELECT
TO authenticated
USING (organization_id IS NOT NULL AND organization_id = public.current_user_organization_id());
