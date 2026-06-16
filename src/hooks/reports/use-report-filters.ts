import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export interface ReportFilters {
  from?: string;
  to?: string;
  channelId?: string;
  queueId?: string;
  agentId?: string;
  convStatus?: string;
  dealStatus?: string;
  campaignStatus?: string;
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString();
}

export function useReportFilters() {
  const search = useSearch({ strict: false }) as Partial<ReportFilters>;
  const navigate = useNavigate();

  const filters = useMemo<ReportFilters>(
    () => ({
      from: search.from ?? defaultFrom(),
      to: search.to,
      channelId: search.channelId || undefined,
      queueId: search.queueId || undefined,
      agentId: search.agentId || undefined,
      convStatus: search.convStatus || undefined,
      dealStatus: search.dealStatus || undefined,
      campaignStatus: search.campaignStatus || undefined,
    }),
    [search],
  );

  const setFilter = useCallback(
    (key: keyof ReportFilters, value: string | undefined) => {
      navigate({
        to: ".",
        search: (prev: any) => ({ ...prev, [key]: value || undefined }),
        replace: true,
      } as any);
    },
    [navigate],
  );

  const clear = useCallback(() => {
    navigate({ to: ".", search: {} as any, replace: true } as any);
  }, [navigate]);

  return { filters, setFilter, clear };
}