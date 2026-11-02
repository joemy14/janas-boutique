import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    return res.status(500).json({ success: false, message: "NEXT_PUBLIC_API_URL is not configured" });
  }

  const phpUrl = new URL(`${baseUrl}/backend/report_sales.php`);
  const requestUrl = new URL(req.url ?? "/", "http://localhost");
  requestUrl.searchParams.forEach((value, key) => phpUrl.searchParams.append(key, value));

  const response = await fetch(phpUrl, {
    headers: { Cookie: req.headers.cookie || "" },
  });
  const body = await response.text();
  const contentType = response.headers.get("content-type");
  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(response.status).send(body);
}
