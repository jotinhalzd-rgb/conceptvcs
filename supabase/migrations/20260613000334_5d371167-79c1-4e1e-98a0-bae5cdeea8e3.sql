
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_articles TO authenticated;
GRANT ALL ON public.knowledge_articles TO service_role;

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_articles_org_select" ON public.knowledge_articles
  FOR SELECT TO authenticated
  USING (organization_id = public.get_user_company() OR organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "knowledge_articles_org_insert" ON public.knowledge_articles
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "knowledge_articles_org_update" ON public.knowledge_articles
  FOR UPDATE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "knowledge_articles_org_delete" ON public.knowledge_articles
  FOR DELETE TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE TRIGGER knowledge_articles_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
