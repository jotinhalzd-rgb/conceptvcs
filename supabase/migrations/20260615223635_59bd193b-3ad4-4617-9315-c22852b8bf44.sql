
-- Allow service_role / postgres (admin/seed flows) to bypass the privilege-escalation trigger,
-- and surface the actual reason when a non-admin caller tries to change protected fields.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_admin boolean;
  caller_role text;
BEGIN
  caller_role := current_setting('request.jwt.claim.role', true);

  -- Service role / postgres (server-side admin) bypasses this guard.
  IF caller_role = 'service_role'
     OR session_user IN ('postgres', 'supabase_admin', 'service_role')
     OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ceo_master','ceo','admin')
  ) INTO caller_is_admin;

  IF NOT caller_is_admin THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Not allowed to change role';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'Not allowed to change organization';
    END IF;
    IF NEW.impersonated_by IS DISTINCT FROM OLD.impersonated_by THEN
      RAISE EXCEPTION 'Not allowed to change impersonation';
    END IF;
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Not allowed to change company';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Backfill: point every existing demo profile at the canonical demo organization
-- so seeded data (contacts, deals, conversations) is visible after login.
UPDATE public.profiles p
   SET organization_id = (SELECT id FROM public.organizations WHERE slug = 'onecontact-demo-corp')
  FROM auth.users u
 WHERE p.id = u.id
   AND u.email LIKE 'demo-%@onecontact.dev';

-- Clean up the orphan personal orgs that were auto-created for demo users
DELETE FROM public.organizations o
 WHERE o.slug LIKE 'personal-organization-%'
   AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.organization_id = o.id);
