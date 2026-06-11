-- Política para agent_knowledge_base
CREATE POLICY "Users can manage knowledge links of their agents" ON public.agent_knowledge_base
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ai_agents a
            JOIN public.profiles p ON p.organization_id = a.organization_id
            WHERE a.id = agent_knowledge_base.agent_id AND p.id = auth.uid()
        )
    );

-- Política para ai_agent_memory
CREATE POLICY "Users can manage memory of their agents" ON public.ai_agent_memory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ai_agents a
            JOIN public.profiles p ON p.organization_id = a.organization_id
            WHERE a.id = ai_agent_memory.agent_id AND p.id = auth.uid()
        )
    );

-- Política para ai_agent_actions
CREATE POLICY "Users can view actions of their agents" ON public.ai_agent_actions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ai_agents a
            JOIN public.profiles p ON p.organization_id = a.organization_id
            WHERE a.id = ai_agent_actions.agent_id AND p.id = auth.uid()
        )
    );
