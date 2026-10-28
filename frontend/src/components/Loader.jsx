import React from "react";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-5 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-body-secondary small mb-0">{message}</p>
    </div>
  );
};

export default Loader;
