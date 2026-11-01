// pages/adminforgotpassword.js
import { useState, useEffect } from "react";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // fade-in animation for form
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      setFadeIn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error connecting to server: " + err.message);
    }
  };

  if (!showForm) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundImage: "url('/images/AuthBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form
        className="auth-card"
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "var(--auth-text)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px",
            marginBottom: 0,
          }}
        >
          Admin Forgot Password
        </h2>
        <div style={{ width: "40px", height: "1px", background: "var(--auth-muted)", margin: "12px auto 24px" }} />

        <input
          className="auth-input"
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="auth-button"
          type="submit"
        >
          Send Reset Link
        </button>

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
      </form>
    </div>
  );
}
