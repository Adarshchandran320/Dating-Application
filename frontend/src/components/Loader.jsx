import React from "react";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-wrapper" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Loader;
