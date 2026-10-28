import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateLogin } from "../utils/validators";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

const LoginPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [clientErrors, setClientErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const errors = validateLogin(formData);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else if (!err.response) {
        setErrorMessage("Cannot reach the server. Please try again.");
      } else {
        setErrorMessage("Login failed. Please check your credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh" }}>
      <div className="form-card" style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }} role="img" aria-label="Heart Lock">
            🔒
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginTop: "0.5rem" }}>Welcome Back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Log in to view matches and manage your profile
          </p>
        </div>

        {errorMessage && <Alert type="danger" message={errorMessage} />}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="login-email"
            label="Email Address"
            required
            error={clientErrors.email}
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="demo1@example.com"
              autoComplete="email"
            />
          </FormField>

          <FormField
            id="login-password"
            label="Password"
            required
            error={clientErrors.password}
          >
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </FormField>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Don't have an account yet?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Sign up
          </Link>
        </p>

        <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "rgba(148, 163, 184, 0.08)", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>Quick Demo Account:</p>
          <code>demo1@example.com</code> / <code>DemoPass#123</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
