import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/fetcher";

interface TopProductRow {
  name: string;
  units: number | string;
  revenue: number | string;
}

const th = "px-4 py-3 text-left text-sm font-semibold";
const td = "px-4 py-3";

export default function TopProductsReport() {
  const [rows, setRows] = useState<TopProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ top_products: TopProductRow[] }>("/api/admin/reports/top-products").then((result) => {
      if (result.success) setRows(result.top_products);
      else setError(result.message);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout title="Top Products Report">
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-4" aria-busy="true">
            <span className="sr-only">Loading top-products report</span>
            <table className="min-w-full divide-y divide-line" aria-hidden="true">
              <thead className="bg-surface-2">
                <tr>
                  {["Product Name", "Units Sold", "Revenue"].map((heading) => (
                    <th key={heading} className={th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {Array.from({ length: 4 }).map((_, row) => (
                  <tr key={row}>
                    {["w-2/3", "w-1/4", "w-1/3"].map((width, column) => (
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
          <p className="p-4 text-muted">No product sales found.</p>
        ) : (
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface-2">
              <tr>
                {["Product Name", "Units Sold", "Revenue"].map((heading) => (
                  <th key={heading} className={th}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, index) => (
                <tr key={`${row.name}-${index}`}>
                  <td className={td}>{row.name}</td>
                  <td className={td}>{Number(row.units).toLocaleString()}</td>
                  <td className={td}>₱{Number(row.revenue).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
