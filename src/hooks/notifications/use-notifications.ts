import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/use-auth";

export type AppNotification = {
  id: string;
  organization_id: string | null;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  payload: any;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  const unreadCount = (query.data ?? []).filter((n) => !n.read_at).length;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  return { ...query, unreadCount, markRead, markAllRead };
}

export type NotificationStatusFilter = "all" | "unread" | "read" | "archived";
export type NotificationPeriod = "24h" | "7d" | "30d" | "all";

export type NotificationListFilters = {
  type?: string | null;
  status?: NotificationStatusFilter;
  period?: NotificationPeriod;
};

function periodToIso(period: NotificationPeriod | undefined): string | null {
  if (!period || period === "all") return null;
  const now = Date.now();
  const ms = period === "24h" ? 86_400_000 : period === "7d" ? 7 * 86_400_000 : 30 * 86_400_000;
  return new Date(now - ms).toISOString();
}

export function useNotificationsList(filters: NotificationListFilters = {}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { type = null, status = "all", period = "30d" } = filters;

  const query = useQuery({
    queryKey: ["notifications", "list", user?.id, type, status, period],
    enabled: !!user?.id,
    queryFn: async (): Promise<AppNotification[]> => {
      let q = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(200);
      if (status === "archived") q = q.not("archived_at", "is", null);
      else q = q.is("archived_at", null);
      if (status === "unread") q = q.is("read_at", null);
      if (status === "read") q = q.not("read_at", "is", null);
      if (type) q = q.eq("type", type);
      const fromIso = periodToIso(period);
      if (fromIso) q = q.gte("created_at", fromIso);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-list:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  return query;
}

export function useArchiveNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useUnarchiveNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ archived_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}