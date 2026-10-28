import React from "react";

const FormField = ({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span style={{ color: "var(--primary)", marginLeft: "4px" }}>*</span>}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
        className: `${children.props.className || "form-input"} ${
          error ? "is-invalid" : ""
        }`,
      })}
      {hint && (
        <span id={hintId} className="form-hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
