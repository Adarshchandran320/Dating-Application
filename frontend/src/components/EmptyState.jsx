import React from "react";

const EmptyState = ({
  icon = "💌",
  title = "No items found",
  description = "There are no records to display right now.",
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
