// components/ForgotPasswordForm.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ForgotPasswordForm({ onClose }) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [email, setEmail] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost/Backend/cc105backend/forgot_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Reset link sent! Check your email.");
      } else {
        setMessage(data.message || "Email not found.");
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
        style={{
          backgroundColor: "rgba(245, 245, 220, 0.6)",
          padding: "30px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          opacity: fadeIn ? 1 : 0,
          transition: "opacity 1s ease-in",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#000",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "28px",
          }}
        >
          Forgot Password
        </h2>

        <form style={{ display: "flex", flexDirection: "column", gap: "15px" }} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              color: "#000",
              backgroundColor: "#fff",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#800000",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              textAlign: "center",
              color: "#000",
              fontSize: "14px",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#000",
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() => {
            if (onClose) onClose();
            else router.push("/auth"); // fallback to Auth page
          }}
        >
          Back to login
        </p>
      </div>
    </div>
  );
}
