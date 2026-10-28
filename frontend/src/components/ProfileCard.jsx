import React from "react";
import { Link } from "react-router-dom";
import { getGenderLabel } from "../utils/constants";

const ProfileCard = ({
  profile,
  onDelete,
  isDeleting = false,
  showMatchDetails = false,
}) => {
  const {
    id,
    name,
    age,
    gender,
    occupation,
    bio,
    hobbies = [],
    favourite_foods = [],
    movie_genres = [],
    is_owner,
    common_hobbies = [],
    common_favourite_foods = [],
    common_movie_genres = [],
    match_score,
  } = profile;

  return (
    <div className="card h-100 border shadow-sm rounded-4 overflow-hidden">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h3 id={`profile-title-${id}`} className="card-title h5 fw-bold text-dark mb-1">
              {name}
            </h3>
            <p className="text-body-secondary small mb-0">
              {age} years old &bull; {getGenderLabel(gender)}
            </p>
          </div>
          {showMatchDetails && match_score !== undefined && (
            <span
              className="badge text-bg-warning rounded-pill px-3 py-2 fw-bold text-dark shadow-sm"
              title={`${match_score} shared preferences`}
            >
              {match_score} {match_score === 1 ? "Match" : "Matches"}
            </span>
          )}
        </div>

        <p className="fw-semibold text-primary small mb-2">{occupation}</p>

        {bio && <p className="card-text small text-body-secondary fst-italic mb-3">"{bio}"</p>}

        {showMatchDetails && (
          <div className="bg-info-subtle border border-info-subtle rounded-3 p-3 mb-3 d-flex flex-column gap-2">
            {common_hobbies.length > 0 && (
              <div>
                <div
                  className="text-uppercase text-secondary fw-bold"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
                >
                  Shared Hobbies
                </div>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {common_hobbies.map((item) => (
                    <span key={item} className="badge rounded-pill text-bg-info text-dark">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {common_favourite_foods.length > 0 && (
              <div>
                <div
                  className="text-uppercase text-secondary fw-bold"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
                >
                  Shared Foods
                </div>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {common_favourite_foods.map((item) => (
                    <span key={item} className="badge rounded-pill text-bg-warning text-dark">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {common_movie_genres.length > 0 && (
              <div>
                <div
                  className="text-uppercase text-secondary fw-bold"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
                >
                  Shared Movie Genres
                </div>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {common_movie_genres.map((item) => (
                    <span key={item} className="badge rounded-pill text-bg-light border text-dark">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-top d-flex flex-column gap-2">
          <div>
            <div
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
            >
              Hobbies
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {hobbies.map((item) => (
                <span key={item} className="badge rounded-pill text-bg-info text-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
            >
              Favourite Foods
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {favourite_foods.map((item) => (
                <span key={item} className="badge rounded-pill text-bg-warning text-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div
              className="text-uppercase text-secondary fw-bold"
              style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}
            >
              Movie Genres
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              {movie_genres.map((item) => (
                <span key={item} className="badge rounded-pill text-bg-light border text-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {is_owner && (
        <div className="card-footer bg-transparent border-top-0 pt-0 pb-3 px-4 d-flex gap-2 justify-content-end">
          <Link to={`/profiles/${id}/edit`} className="btn btn-outline-secondary btn-sm">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => onDelete && onDelete(id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
