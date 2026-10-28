import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      <section className="dashboard-hero">
        <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">{user?.email}</p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          {user?.profile_id ? (
            <Link to={`/profiles/${user.profile_id}/edit`} className="btn btn-primary">
              ✏️ Edit My Profile
            </Link>
          ) : (
            <Link to="/profiles/new" className="btn btn-primary">
              ✨ Create My Profile
            </Link>
          )}

          <Link to="/matches" className="btn btn-secondary">
            💘 View Match Suggestions
          </Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1rem" }}>Quick Navigation</h2>
        <div className="dashboard-nav-grid">
          <Link to="/profiles" className="dashboard-card">
            <span style={{ fontSize: "1.8rem" }}>👥</span>
            <h3 className="dashboard-card-title">Browse Profiles</h3>
            <p className="dashboard-card-desc">
              Discover members across all age ranges, hobbies, and favorite movies.
            </p>
          </Link>

          <Link to="/filter" className="dashboard-card">
            <span style={{ fontSize: "1.8rem" }}>🔍</span>
            <h3 className="dashboard-card-title">Advanced Search & Filter</h3>
            <p className="dashboard-card-desc">
              Filter by age brackets, gender, specific hobbies, foods, or movie genres.
            </p>
          </Link>

          <Link to="/matches" className="dashboard-card">
            <span style={{ fontSize: "1.8rem" }}>🎯</span>
            <h3 className="dashboard-card-title">Match Suggestions</h3>
            <p className="dashboard-card-desc">
              See intelligent recommendations calculated by preference overlap.
            </p>
          </Link>

          {user?.profile_id ? (
            <Link to={`/profiles/${user.profile_id}/edit`} className="dashboard-card">
              <span style={{ fontSize: "1.8rem" }}>⚙️</span>
              <h3 className="dashboard-card-title">Manage Profile</h3>
              <p className="dashboard-card-desc">
                Update your hobbies, favorite foods, occupation, and bio anytime.
              </p>
            </Link>
          ) : (
            <Link to="/profiles/new" className="dashboard-card">
              <span style={{ fontSize: "1.8rem" }}>📝</span>
              <h3 className="dashboard-card-title">Create Profile</h3>
              <p className="dashboard-card-desc">
                Set up your dating profile to start receiving customized match suggestions.
              </p>
            </Link>
          )}
        </div>
      </section>

      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
