import React from "react";

const EmptyState = ({
  icon = <i className="bi bi-heart" aria-hidden="true"></i>,
  title = "No items found",
  description = "There are no records to display right now.",
  action,
}) => {
  const renderedIcon =
    typeof icon === "string" && (icon.startsWith("bi-") || icon.startsWith("bi ")) ? (
      <i className={icon.startsWith("bi-") ? `bi ${icon}` : icon} aria-hidden="true"></i>
    ) : (
      icon
    );

  return (
    <div
      className="bg-info-subtle border rounded-4 p-4 p-md-5 text-center my-4 mx-auto shadow-sm"
      style={{ maxWidth: "600px" }}
    >
      <div className="display-4 mb-3 text-secondary" aria-hidden="true">
        {renderedIcon}
      </div>
      <h3 className="fw-bold mb-2 text-dark">{title}</h3>
      <p className="text-body-secondary mb-4">{description}</p>
      {action && <div className="d-flex justify-content-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
