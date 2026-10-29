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
      const res = await fetch("http://localhost/Backend/cc105backend/forgot_password.php", {
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
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          padding: "30px",
          borderRadius: "10px",
          backgroundColor: "rgba(245, 245, 220, 0.6)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px",
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
          Admin Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Admin Email"
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
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#800000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send Reset Link
        </button>

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
      </form>
    </div>
  );
}
