import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="brand" aria-label="HeartSync Dating App Home">
          <span role="img" aria-hidden="true">
            💖
          </span>{" "}
          HeartSync
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profiles"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Browse Profiles
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/filter"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Filter
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/matches"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Matches
              </NavLink>
            </li>
            {user?.profile_id ? (
              <li>
                <NavLink
                  to={`/profiles/${user.profile_id}/edit`}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  My Profile
                </NavLink>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/profiles/new"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  + New Profile
                </NavLink>
              </li>
            )}
            {user && (
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  aria-label="Log out of your account"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
