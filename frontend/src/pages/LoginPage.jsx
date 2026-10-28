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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card shadow-sm rounded-4 border">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="fs-1 d-block mb-1 text-primary">
                  <i className="bi bi-heart-fill" aria-hidden="true"></i>
                </span>
                <h1 className="h3 fw-bold text-primary mb-1">HeartSync</h1>
                <p className="text-body-secondary small mb-0">
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
                  className="btn btn-primary w-100 py-2 mt-3 rounded-pill"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  {isSubmitting ? "Logging In..." : "Log In"}
                </button>
              </form>

              <p className="text-center text-body-secondary small mt-4 mb-0">
                Don't have an account yet?{" "}
                <Link to="/signup" className="text-primary fw-semibold text-decoration-none">
                  Sign up
                </Link>
              </p>

              <div className="mt-4 p-3 bg-light rounded-3 small border text-body-secondary">
                <p className="fw-semibold text-secondary mb-1">Quick Demo Account:</p>
                <code>demo1@example.com</code> / <code>DemoPass#123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
