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
            fontFamily: "'Playfair Display', 'Times New Roman', Times, serif",
            fontSize: "32px",
          }}
        >
          Sign In
        </h2>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          onSubmit={handleSubmit}
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              color: "#000",
              backgroundColor: "#fff",
            }}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
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
              backgroundColor: "#8B2A3C",
              color: "#fff",
              fontWeight: "500",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

           <p
              style={{
                textAlign: "center",
                marginTop: "15px",
                color: "#000",
                fontSize: "14px",
              }}
            >
              Don't have an account yet?{" "}
              <span
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "#8B2A3C",
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
