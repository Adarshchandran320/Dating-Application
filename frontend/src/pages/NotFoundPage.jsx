import React from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
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
      </div>
    </div>
  );
};

export default NotFoundPage;
