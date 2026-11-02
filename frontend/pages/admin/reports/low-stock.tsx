import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/fetcher";

interface LowStockRow {
  product: string;
  size: string;
  stock_quantity: number | string;
  reorder_level: number | string;
}

const th = "px-4 py-3 text-left text-sm font-semibold";
const td = "px-4 py-3";

export default function LowStockReport() {
  const [rows, setRows] = useState<LowStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ low_stock: LowStockRow[] }>("/api/admin/reports/low-stock").then((result) => {
      if (result.success) setRows(result.low_stock);
      else setError(result.message);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout title="Low Stock Report">
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-4" aria-busy="true">
            <span className="sr-only">Loading low-stock report</span>
            <table className="min-w-full divide-y divide-line" aria-hidden="true">
              <thead className="bg-surface-2">
                <tr>
                  {["Product", "Size", "Stock", "Reorder Level"].map((heading) => (
                    <th key={heading} className={th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {Array.from({ length: 4 }).map((_, row) => (
                  <tr key={row}>
                    {["w-2/3", "w-1/3", "w-1/4", "w-1/3"].map((width, column) => (
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
          <p className="p-4 text-muted">No low-stock products found.</p>
        ) : (
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-2">
              <tr>
                {["Product", "Size", "Stock", "Reorder Level"].map((heading) => (
                  <th key={heading} className={th}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, index) => (
                <tr key={`${row.product}-${row.size}-${index}`}>
                  <td className={td}>{row.product}</td>
                  <td className={td}>{row.size}</td>
                  <td className={td}>{row.stock_quantity}</td>
                  <td className={td}>{row.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
