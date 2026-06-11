import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`);
      setSession(session);
      setLoading(false);
      
      if (event === 'SIGNED_OUT') {
        // Garantir que a limpeza seja completa no logout
        setSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading, user: session?.user };
}

export function useProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
