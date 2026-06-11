-- Fix security search_path for handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Ensure profiles and organizations have proper RLS if they don't already
DO $$
BEGIN
    -- Enable RLS on organizations
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for organizations if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view their own organization') THEN
        CREATE POLICY "Users can view their own organization" ON public.organizations
        FOR SELECT USING (
            id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
        );
    END IF;

    -- Enable RLS on profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies for profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Grant permissions to authenticated users
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.organizations TO service_role;
