import React from "react";

const IconBadge = ({ icon, className = "" }) => {
  const iconClass = icon?.startsWith("bi-") ? icon : `bi-${icon}`;

  return (
    <div
      className={`bg-info-subtle text-secondary rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
      style={{ width: "52px", height: "52px" }}
      aria-hidden="true"
    >
      <i className={`bi ${iconClass} fs-4`} aria-hidden="true"></i>
    </div>
  );
};

export default IconBadge;
