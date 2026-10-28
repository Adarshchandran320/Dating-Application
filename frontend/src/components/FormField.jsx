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

  const defaultInputClass =
    children.type === "select"
      ? "form-select"
      : "form-control";

  const existingClass = children.props.className || defaultInputClass;
  const finalClass = `${existingClass} ${error ? "is-invalid" : ""}`.trim();

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">
        {label}
        {required && <span className="text-primary ms-1">*</span>}
      </label>
      {React.cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby":
          [errorId, hintId].filter(Boolean).join(" ") || undefined,
        className: finalClass,
      })}
      {hint && (
        <div id={hintId} className="form-text text-body-secondary">
          {hint}
        </div>
      )}
      {error && (
        <div id={errorId} className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
