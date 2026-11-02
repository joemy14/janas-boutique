import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!baseUrl) {
      return res.status(500).json({ success: false, message: "NEXT_PUBLIC_API_URL is not configured" });
    }

    const response = await fetch(`${baseUrl}/backend/admin_stats.php`, {
      headers: { Cookie: req.headers.cookie || "" },
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    if (!response.ok) return res.status(response.status).send(body);

    const stats = JSON.parse(body) as {
      total_products?: number;
      total_orders?: number;
      total_earnings?: number;
    };
    return res.status(response.status).json({
      success: true,
      totalProducts: Number(stats.total_products ?? 0),
      totalOrders: Number(stats.total_orders ?? 0),
      totalEarnings: Number(stats.total_earnings ?? 0),
    });
  },
});
