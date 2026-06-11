import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for bypass session
    const bypassSession = localStorage.getItem("onecontact_bypass_session");
    if (bypassSession) {
      setSession(JSON.parse(bypassSession));
      setLoading(false);
      return;
    }

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
        setSession(null);
        localStorage.removeItem("onecontact_bypass_session");
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
      
      // If bypass user, return mock profile
      if (user.id === "bypass-ceo-id") {
        return {
          id: "bypass-ceo-id",
          full_name: "CEO Demo (Bypass)",
          role: "ceo",
          organizations: {
            name: "ONECONTACT DEMO COMPANY"
          }
        };
      }

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
