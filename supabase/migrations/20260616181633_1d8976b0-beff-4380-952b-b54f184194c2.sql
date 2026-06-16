
-- Allow org admins to upsert/update/delete their own white-label config
CREATE POLICY "Admins manage own white label config"
ON public.white_label_configs_v2
FOR ALL
TO authenticated
USING (
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ceo_master','ceo','admin'))
)
WITH CHECK (
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ceo_master','ceo','admin'))
);
