-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  org_id uuid;
  org_name text;
  org_slug text;
BEGIN
  -- Determine org name and slug
  org_name := COALESCE(new.raw_user_meta_data->>'organization_name', 'Personal Organization');
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Check if an organization for the user should be created or linked
  -- Check by slug to avoid duplicates or just create new
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug || '-' || substr(md5(random()::text), 1, 6))
  RETURNING id INTO org_id;

  INSERT INTO public.profiles (id, full_name, role, organization_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    org_id
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure Demo Organization exists
INSERT INTO public.organizations (name, slug)
SELECT 'ONECONTACT DEMO COMPANY', 'onecontact-demo'
WHERE NOT EXISTS (SELECT 1 FROM public.organizations WHERE slug = 'onecontact-demo');
