import { apiHandler, str } from "@/lib/api";

export default apiHandler({
  async POST(req, res) {
    const token = str(req.body?.token);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid or missing token." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!backendUrl) {
      return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }

    const result = await fetch(`${backendUrl}/reset_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).then((response) => response.json());

    if (!result.success && /(invalid|used|expired)/i.test(String(result.message ?? ""))) {
      return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
    }
    if (!result.success) {
      return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }

    return res.status(200).json({ success: true });
  },
});
