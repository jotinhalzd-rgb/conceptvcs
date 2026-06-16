import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getDevRoleOverride, isDevEnvironment } from "@/lib/dev-mode";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) console.log(`Auth event: ${event}`);
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
      
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { session, loading, user: session?.user };
}

export function useProfile() {
  const { user } = useAuth();
  const [devTick, setDevTick] = useState(0);

  useEffect(() => {
    if (!isDevEnvironment()) return;
    const handler = () => setDevTick((t) => t + 1);
    window.addEventListener("onecontact:dev-role-change", handler);
    return () => window.removeEventListener("onecontact:dev-role-change", handler);
  }, []);

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies(*)")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    select: (data) => {
      if (!data) return data;
      const override = getDevRoleOverride();
      if (!override) return data;
      return { ...data, role: override, _dev_role_override: true } as typeof data;
    },
  });
}
