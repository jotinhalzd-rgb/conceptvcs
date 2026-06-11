import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    // Check local storage for bypass session
    const checkBypass = () => {
      try {
        const bypassSession = localStorage.getItem("onecontact_bypass_session");
        if (bypassSession) {
          const parsed = JSON.parse(bypassSession);
          if (mounted) {
            setSession(parsed);
            setLoading(false);
          }
          return true;
        }
      } catch (e) {
        console.error("Error parsing bypass session", e);
      }
      return false;
    };

    if (checkBypass()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`);
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem("onecontact_bypass_session");
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
  
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // If bypass user, return mock profile with appropriate role
      if (user.id.startsWith("bypass-")) {
        const role = user.id.replace("bypass-", "").replace("-id", "");
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Demo User",
          role: role,
          company_id: "00000000-0000-0000-0000-000000000000",
          companies: {
            name: "ONECONTACT DEMO CORP"
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
