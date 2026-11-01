import { apiHandler, EMAIL_PATTERN, str } from "@/lib/api";

export default apiHandler({
  async POST(req, res) {
    const firstName = str(req.body?.firstName);
    const lastName = str(req.body?.lastName);
    const email = str(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First and last name are required." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address!" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!backendUrl) {
      return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }

    const result = await fetch(`${backendUrl}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    }).then((response) => response.json());

    if (!result.success) {
      const duplicate = String(result.message ?? "").toLowerCase().includes("exist");
      return res.status(duplicate ? 409 : 500).json({
        success: false,
        message: duplicate ? "An account with this email already exists." : "Something went wrong. Please try again.",
      });
    }

    return res.status(201).json({ success: true });
  },
});
