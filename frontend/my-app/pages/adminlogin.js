// pages/adminlogin.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost/Backend/cc105backend/admin_login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Save admin info to localStorage
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            email: email,
            is_admin: 1, // mark as admin
          })
        );

        setMessage("Login successful! Redirecting to admin dashboard...");
        setTimeout(() => {
          router.push("/admindashboard");
        }, 1500);
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Logging in..." : "Login"}
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

        {/* Forgot Password + Back to User Login */}
<div style={{ textAlign: "center", marginTop: "15px", fontFamily: "'Times New Roman', Times, serif" }}>
  <p style={{ marginBottom: "10px" }}>
    <a href="/adminforgotpassword" style={{ color: "#800000", fontFamily: "'Times New Roman', Times, serif" }}>
      Forgot Password?
    </a>
  </p>
  <p style={{ marginTop: "10px" }}>
    <a
      onClick={() => router.push("/auth?form=login")}
      style={{ color: "#800000", cursor: "pointer", fontFamily: "'Times New Roman', Times, serif" }}
    >
      Back to User Login
    </a>
  </p>
</div>

      </form>
    </div>
  );
}
