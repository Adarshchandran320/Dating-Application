import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import IconBadge from "../components/IconBadge";

const DashboardPage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh user state on mount to ensure profile_id is current
    refreshUser();
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="card shadow-sm rounded-4 border overflow-hidden mb-4">
        <div className="bg-secondary p-3 text-white d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge text-bg-warning rounded-pill px-3 py-1 fw-bold text-dark d-inline-flex align-items-center gap-1">
              <i className="bi bi-heart-fill" aria-hidden="true"></i>
              Member Dashboard
            </span>
            <span className="small text-white-50">{user?.email}</span>
          </div>
          {user?.profile_id && (
            <span className="badge text-bg-info text-dark rounded-pill px-3 py-1">
              Profile Active
            </span>
          )}
        </div>

        <div className="card-body p-4 p-md-5 text-center">
          <h1 className="h2 fw-bold text-dark mb-2">Welcome, {user?.name}!</h1>
          <p className="lead text-body-secondary mb-4 mx-auto" style={{ maxWidth: "600px" }}>
            Ready to find someone special? Explore members, search by interests, or view your personalized match recommendations.
          </p>

          <div className="d-flex justify-content-center gap-2 flex-wrap">
            {user?.profile_id ? (
              <Link
                to={`/profiles/${user.profile_id}/edit`}
                className="btn btn-primary px-4 py-2 shadow-sm rounded-pill"
              >
                <i className="bi bi-pencil-square me-2" aria-hidden="true"></i>
                Edit My Profile
              </Link>
            ) : (
              <Link
                to="/profiles/new"
                className="btn btn-primary px-4 py-2 shadow-sm rounded-pill"
              >
                <i className="bi bi-pencil-square me-2" aria-hidden="true"></i>
                Create My Profile
              </Link>
            )}

            <Link
              to="/matches"
              className="btn btn-outline-secondary px-4 py-2 rounded-pill"
            >
              <i className="bi bi-hearts me-2" aria-hidden="true"></i>
              View Match Suggestions
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="h5 fw-bold text-secondary mb-3">Quick Actions</h2>
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border shadow-sm rounded-4">
              <div className="card-body d-flex flex-column p-4">
                <IconBadge icon="bi-people-fill" className="mb-3" />
                <h3 className="card-title h6 fw-bold text-dark">Browse Profiles</h3>
                <p className="card-text small text-body-secondary mb-3 flex-grow-1">
                  Discover members across all age ranges, hobbies, and favorite movies.
                </p>
                <Link
                  to="/profiles"
                  className="btn btn-outline-primary btn-sm rounded-pill mt-auto"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border shadow-sm rounded-4">
              <div className="card-body d-flex flex-column p-4">
                <IconBadge icon="bi-search" className="mb-3" />
                <h3 className="card-title h6 fw-bold text-dark">Filter Profiles</h3>
                <p className="card-text small text-body-secondary mb-3 flex-grow-1">
                  Filter by age brackets, gender, specific hobbies, foods, or movie genres.
                </p>
                <Link
                  to="/filter"
                  className="btn btn-outline-primary btn-sm rounded-pill mt-auto"
                >
                  Search
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border shadow-sm rounded-4">
              <div className="card-body d-flex flex-column p-4">
                <IconBadge icon="bi-bullseye" className="mb-3" />
                <h3 className="card-title h6 fw-bold text-dark">Match Suggestions</h3>
                <p className="card-text small text-body-secondary mb-3 flex-grow-1">
                  See intelligent recommendations calculated by preference overlap.
                </p>
                <Link
                  to="/matches"
                  className="btn btn-outline-primary btn-sm rounded-pill mt-auto"
                >
                  View Matches
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border shadow-sm rounded-4">
              <div className="card-body d-flex flex-column p-4">
                <IconBadge icon="bi-sliders" className="mb-3" />
                <h3 className="card-title h6 fw-bold text-dark">
                  {user?.profile_id ? "Manage Profile" : "Create Profile"}
                </h3>
                <p className="card-text small text-body-secondary mb-3 flex-grow-1">
                  {user?.profile_id
                    ? "Update your hobbies, favorite foods, occupation, and bio anytime."
                    : "Set up your dating profile to start receiving customized match suggestions."}
                </p>
                <Link
                  to={
                    user?.profile_id
                      ? `/profiles/${user.profile_id}/edit`
                      : "/profiles/new"
                  }
                  className="btn btn-outline-primary btn-sm rounded-pill mt-auto"
                >
                  {user?.profile_id ? "Edit Profile" : "Get Started"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline-secondary btn-sm px-4 rounded-pill"
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
