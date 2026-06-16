import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useInvoices } from "@/hooks/billing/use-billing";

export function InvoiceList() {
  const { data: invoices = [], isLoading } = useInvoices();

  if (isLoading) return <div className="h-40 animate-pulse bg-white/[0.02] rounded-xl" />;
  if (!invoices || invoices.length === 0) {
    return <EmptyState icon={FileText} title="Nenhuma fatura emitida" description="Suas faturas aparecerão aqui quando o gateway de pagamento estiver ativo." />;
  }

  return (
    <div className="rounded-xl border border-white/5 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-slate-500">
          <tr>
            <th className="text-left p-3">Valor</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Vencimento</th>
            <th className="text-left p-3">Pago em</th>
            <th className="text-right p-3">PDF</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv: any) => (
            <tr key={inv.id} className="border-t border-white/5">
              <td className="p-3 text-white font-bold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: inv.currency_code || "BRL" }).format(Number(inv.amount_total))}
              </td>
              <td className="p-3"><Badge variant="outline" className="text-[9px]">{inv.invoice_status ?? "—"}</Badge></td>
              <td className="p-3 text-slate-400 text-xs">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("pt-BR") : "—"}</td>
              <td className="p-3 text-slate-400 text-xs">{inv.paid_at ? new Date(inv.paid_at).toLocaleDateString("pt-BR") : "—"}</td>
              <td className="p-3 text-right">
                {inv.invoice_pdf_url ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={inv.invoice_pdf_url} target="_blank" rel="noreferrer" className="gap-1">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  </Button>
                ) : <span className="text-xs text-slate-600">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
