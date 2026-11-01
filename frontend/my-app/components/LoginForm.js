// components/LoginForm.js
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "../pages/_app";

export default function LoginForm({ onClose }) {
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      setFadeIn(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
  login(data.user);
  if (data.user.role === "admin") {
    router.push("/admindashboard");
  } else if (data.user.role === "staff") {
    router.push("/admin/orders");
  } else {
    router.push("/profile");
  }
} else {
  alert(data.message || "Invalid email or password");
}
    } catch (err) {
      alert("Error connecting to server: " + err.message);
    }
  };

  if (!showForm) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(20,17,15,0.72), rgba(20,17,15,0.72)), url('/images/AuthBackground.jpg')",
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
        <div className="auth-brand" style={{ fontSize: "16px", letterSpacing: "0.2em" }}>
          Jana&apos;s <span style={{ fontSize: "11px" }}>Boutique</span>
        </div>
        <h2
          style={{
            textAlign: "center",
            color: "var(--auth-text)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px",
            marginBottom: 0,
          }}
        >
          Sign In
        </h2>
        <div style={{ width: "40px", height: "1px", background: "var(--auth-muted)", margin: "12px auto 24px" }} />

        <form
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          onSubmit={handleSubmit}
        >
          <input
            className="auth-input"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            className="auth-input"
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            className="auth-button"
            type="submit"
          >
            Sign In
          </button>
        </form>

           <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                color: "#F3EBDD",
                fontSize: "14px",
              }}
            >
              Don&apos;t have an account yet?{" "}
              <span
                className="auth-link"
                style={{
                  cursor: "pointer",
                }}
                onClick={() => onClose && onClose()}
              >
                Sign up
              </span>
              
            </p>
      </div>
    </div>
  );
}
