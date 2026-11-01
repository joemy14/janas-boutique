import { apiHandler, str } from "@/lib/api";

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Please enter your registered email." });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
    if (!backendUrl) {
      return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }

    const result = await fetch(`${backendUrl}/forgot_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((response) => response.json());

    // Keep the same response whether or not the account exists.
    if (!result.success && !String(result.message ?? "").toLowerCase().includes("email not found")) {
      return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
    }

    // Same response either way so the endpoint can't be used to discover accounts.
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  },
});
