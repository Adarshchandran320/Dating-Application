import React from "react";

const Alert = ({ type = "danger", message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`alert alert-${type} d-flex justify-content-between align-items-center mb-3 shadow-sm rounded-3`}
      role="alert"
    >
      <div className="d-flex align-items-center">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close ms-2"
          onClick={onClose}
          aria-label="Close"
        />
      )}
    </div>
  );
};

export default Alert;
