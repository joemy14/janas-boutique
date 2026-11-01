import { apiHandler, str } from "@/lib/api";
import { loginWithBackend, setSessionCookie } from "@/lib/auth";

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const adminOnly = req.body?.admin === true;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter both email and password." });
    }

    const result = await loginWithBackend(email, password);
    if (!result.success || !result.user) {
      return res.status(401).json({ success: false, message: result.message ?? "Invalid email or password." });
    }
    if (adminOnly && !result.user.isAdmin) {
      return res.status(403).json({ success: false, message: "This account is not an admin." });
    }

    setSessionCookie(res, result.user);
    return res.status(200).json({ success: true, user: result.user });
  },
});
