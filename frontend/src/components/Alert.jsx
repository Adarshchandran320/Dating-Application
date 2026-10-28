import React from "react";

const Alert = ({ type = "danger", message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem",
            marginLeft: "0.5rem",
          }}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
