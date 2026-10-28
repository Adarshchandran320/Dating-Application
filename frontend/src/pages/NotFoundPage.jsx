import React from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const NotFoundPage = () => {
  return (
    <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
      <EmptyState
        icon="🧭"
        title="404 - Page Not Found"
        description="The page you are looking for does not exist or may have been moved."
        action={
          <Link to="/dashboard" className="btn btn-primary">
            Return to Dashboard
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
