import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    return res.status(500).json({ success: false, message: "NEXT_PUBLIC_API_URL is not configured" });
  }

  const response = await fetch(`${baseUrl}/backend/confirm_payment.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.cookie || "",
    },
    body: JSON.stringify(req.body),
  });
  const body = await response.text();
  const contentType = response.headers.get("content-type");
  if (contentType) res.setHeader("Content-Type", contentType);
  return res.status(response.status).send(body);
}
