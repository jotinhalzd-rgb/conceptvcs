-- Fix 0011_function_search_path_mutable
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Fix 0008_rls_enabled_no_policy for remaining tables

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Channels: Filtered by organization
CREATE POLICY "Users can manage channels in their organization" ON public.channels
    FOR ALL USING (organization_id IN (SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Pipelines: Filtered by organization
CREATE POLICY "Users can manage pipelines in their organization" ON public.pipelines
    FOR ALL USING (organization_id IN (SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Stages: Filtered by organization (through pipeline)
CREATE POLICY "Users can manage stages in their organization" ON public.stages
    FOR ALL USING (pipeline_id IN (
        SELECT pipe.id FROM public.pipelines pipe 
        JOIN public.profiles prof ON pipe.organization_id = prof.organization_id
        WHERE prof.id = auth.uid()
    ));
