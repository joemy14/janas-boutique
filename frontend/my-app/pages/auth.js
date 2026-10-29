// pages/auth.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LoginForm from "../components/LoginForm";
import RegistrationForm from "../components/RegistrationForm";

export default function AuthPage() {
  const [currentForm, setCurrentForm] = useState("register"); // "login" | "register"
  const [showForm, setShowForm] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const router = useRouter();

  // fade-in animation for forms
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      setFadeIn(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // switch to login form
  const handleSwitchToLogin = () => setCurrentForm("login");

  // switch to register form
  const handleSwitchToRegister = () => setCurrentForm("register");

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
      {currentForm === "login" && (
        <LoginForm onClose={handleSwitchToRegister} />
      )}

      {currentForm === "register" && (
        <RegistrationForm
          onClose={() => {
            handleSwitchToLogin(); // after successful registration, switch to login
          }}
        />
      )}
    </div>
  );
}
