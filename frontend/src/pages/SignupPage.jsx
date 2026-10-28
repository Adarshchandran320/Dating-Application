import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signup as apiSignup } from "../api/endpoints";
import { extractApiError } from "../utils/errors";
import { validateSignup } from "../utils/validators";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

const SignupPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (field) => {
    const errors = validateSignup(formData);
    if (errors[field]) {
      setClientErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});
    setServerMessage("");
    setSuccessMessage("");

    const errors = validateSignup(formData);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiSignup(formData);
      setSuccessMessage("Account created. Redirecting to login…");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const { fieldErrors, message } = extractApiError(err);
      setServerErrors(fieldErrors);
      setServerMessage(message || "Registration failed. Please check the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field) => clientErrors[field] || serverErrors[field];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card shadow-sm rounded-4 border">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <span className="fs-1 d-block mb-1" role="img" aria-label="Heart">
                  💘
                </span>
                <h1 className="h3 fw-bold text-primary mb-1">HeartSync</h1>
                <p className="text-body-secondary small mb-0">
                  Create an account to find meaningful connections
                </p>
              </div>

              {successMessage && <Alert type="success" message={successMessage} />}
              {serverMessage && !successMessage && (
                <Alert type="danger" message={serverMessage} />
              )}

              <form onSubmit={handleSubmit} noValidate>
                <FormField
                  id="signup-name"
                  label="Full Name"
                  required
                  error={getFieldError("name")}
                >
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Alex Morgan"
                    autoComplete="name"
                  />
                </FormField>

                <FormField
                  id="signup-email"
                  label="Email Address"
                  required
                  error={getFieldError("email")}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    placeholder="alex@example.com"
                    autoComplete="email"
                  />
                </FormField>

                <FormField
                  id="signup-password"
                  label="Password"
                  hint="Minimum 8 characters"
                  required
                  error={getFieldError("password")}
                >
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </FormField>

                <FormField
                  id="signup-confirm-password"
                  label="Confirm Password"
                  required
                  error={getFieldError("confirm_password")}
                >
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirm_password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </FormField>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mt-3"
                  disabled={isSubmitting || !!successMessage}
                >
                  {isSubmitting && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  {isSubmitting ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <p className="text-center text-body-secondary small mt-4 mb-0">
                Already have an account?{" "}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
