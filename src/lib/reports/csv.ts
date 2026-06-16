export function toCSV<T extends Record<string, any>>(
  rows: T[],
  headers: { key: keyof T; label: string }[],
): string {
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = headers.map((h) => escape(h.label)).join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h.key])).join(",")).join("\n");
  return head + "\n" + body;
}

export function downloadCSV(filename: string, csv: string) {
  // BOM for Excel UTF-8 support
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function csvFilename(slug: string) {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `relatorio-${slug}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.csv`;
}