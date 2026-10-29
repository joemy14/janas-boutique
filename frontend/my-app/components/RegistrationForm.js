// components/RegistrationForm.js
import { useState, useEffect } from "react";

export default function RegistrationForm({ onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

  // -------------------------------
  // REGISTER
  // -------------------------------
  const handleRegister = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost/Backend/CC105Backend/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration successful!");
        if (onClose) onClose("login-success", { email: formData.email });
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      alert("Error connecting to server: " + err.message);
    }
  };

  // -------------------------------
  // HANDLE FORM SUBMIT
  // -------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    handleRegister();
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
          Create an Account
        </h2>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          onSubmit={handleSubmit}
        >
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
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
              backgroundColor: "#fff",
              color: "#000",
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
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
              color: "#000",
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
            Create Account
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
          Already have an account?{" "}
          <span
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              color: "#800000",
            }}
            onClick={() => onClose && onClose("switch-to-login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
