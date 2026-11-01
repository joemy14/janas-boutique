// components/ResetPasswordForm.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { token } = router.query;

  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      setFadeIn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!token) setMessage("Invalid or missing token.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/auth"), 3000);
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/images/AuthBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        filter: "contrast(1.05) saturate(1.1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="auth-card"
        style={{
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "var(--auth-text)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px",
            marginBottom: 0,
          }}
        >
          Reset Password
        </h2>
        <div style={{ width: "40px", height: "1px", background: "var(--auth-muted)", margin: "12px auto 24px" }} />

        <form style={{ display: "flex", flexDirection: "column", gap: "15px" }} onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: "#1A1A1A",
              fontSize: "14px",
              fontFamily: "'Playfair Display', 'Times New Roman', Times, serif",
            }}
          >
            {message}
          </p>
        )}

        <p
          className="auth-link"
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
            cursor: "pointer",
          }}
          onClick={() => router.push("/auth")}
        >
          Back to login
        </p>
      </div>
    </div>
  );
}
