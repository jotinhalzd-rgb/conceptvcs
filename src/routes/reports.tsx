import { createFileRoute } from "@tanstack/react-router";
import { ReportsView } from "@/components/reports/reports-view";

export const Route = createFileRoute("/reports")({ component: ReportsView });