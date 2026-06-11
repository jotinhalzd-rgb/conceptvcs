-- 1. Create Tables
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.company_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'OPERATOR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Grant Access
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.company_users TO authenticated;
GRANT ALL ON TABLE public.companies TO service_role;
GRANT ALL ON TABLE public.company_users TO service_role;

-- 3. RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their companies" ON public.companies FOR SELECT USING (id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their company associations" ON public.company_users FOR SELECT USING (user_id = auth.uid());

-- 4. Helper for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();