import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/fetcher";

interface SalesRow {
  date: string;
  orders: number | string;
  revenue: number | string;
}

const th = "px-4 py-3 text-left text-sm font-semibold";
const td = "px-4 py-3";

export default function SalesReport() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const query = params.toString();

    setLoading(true);
    setError("");
    api<{ sales: SalesRow[] }>(`/api/admin/reports/sales${query ? `?${query}` : ""}`).then((result) => {
      if (!active) return;
      if (result.success) setRows(result.sales);
      else setError(result.message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [from, to]);

  return (
    <AdminLayout title="Sales Report">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span>From</span>
            <input className="input-field" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>To</span>
            <input className="input-field" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>

        <div className="card overflow-x-auto">
          {loading ? (
            <div className="p-4" aria-busy="true">
              <span className="sr-only">Loading sales report</span>
              <table className="min-w-full divide-y divide-line" aria-hidden="true">
                <thead className="bg-surface-2">
                  <tr>
                    {["Date", "Orders", "Revenue"].map((heading) => (
                      <th key={heading} className={th}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {Array.from({ length: 4 }).map((_, row) => (
                    <tr key={row}>
                      {["w-1/2", "w-1/4", "w-1/3"].map((width, column) => (
                        <td key={column} className={td}>
                          <div className={`h-4 ${width} animate-pulse rounded bg-surface-2`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <p className="p-4 text-accent">{error}</p>
          ) : rows.length === 0 ? (
            <p className="p-4 text-muted">No sales found for this date range.</p>
          ) : (
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-surface-2">
                <tr>
                  {["Date", "Orders", "Revenue"].map((heading) => (
                    <th key={heading} className={th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.date}>
                    <td className={td}>{row.date}</td>
                    <td className={td}>{Number(row.orders).toLocaleString()}</td>
                    <td className={td}>₱{Number(row.revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
