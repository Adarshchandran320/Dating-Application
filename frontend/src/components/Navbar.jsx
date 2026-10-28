import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeNav = () => setIsOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary sticky-top shadow-sm py-2">
      <div className="container">
        <Link
          to="/dashboard"
          className="navbar-brand text-white fw-bold d-flex align-items-center gap-2"
          onClick={closeNav}
          aria-label="HeartSync Dating App Home"
        >
          <i className="bi bi-heart-fill text-white" aria-hidden="true"></i>
          <span>HeartSync</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-controls="main-navbar-nav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="main-navbar-nav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 gap-lg-2 mt-3 mt-lg-0">
            <li className="nav-item">
              <NavLink
                to="/dashboard"
                onClick={closeNav}
                className={({ isActive }) =>
                  `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/profiles"
                onClick={closeNav}
                className={({ isActive }) =>
                  `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                }
              >
                Browse Profiles
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/filter"
                onClick={closeNav}
                className={({ isActive }) =>
                  `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                }
              >
                Filter
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/matches"
                onClick={closeNav}
                className={({ isActive }) =>
                  `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                }
              >
                Matches
              </NavLink>
            </li>
            {user?.profile_id ? (
              <li className="nav-item">
                <NavLink
                  to={`/profiles/${user.profile_id}/edit`}
                  onClick={closeNav}
                  className={({ isActive }) =>
                    `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                  }
                >
                  My Profile
                </NavLink>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink
                  to="/profiles/new"
                  onClick={closeNav}
                  className={({ isActive }) =>
                    `nav-link px-3 py-1 ${isActive ? "active text-white fw-semibold" : ""}`
                  }
                >
                  + New Profile
                </NavLink>
              </li>
            )}
            {user && (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button
                  type="button"
                  onClick={() => {
                    closeNav();
                    handleLogout();
                  }}
                  className="btn btn-outline-light btn-sm px-3 rounded-pill"
                  aria-label="Log out of your account"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
