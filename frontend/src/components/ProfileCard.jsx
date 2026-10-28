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
    <article className="profile-card" aria-labelledby={`profile-title-${id}`}>
      <div className="profile-card-header">
        <div>
          <h3 id={`profile-title-${id}`} className="profile-name">
            {name}
          </h3>
          <p className="profile-age-gender">
            {age} years old &bull; {getGenderLabel(gender)}
          </p>
        </div>
        {showMatchDetails && match_score !== undefined && (
          <span className="match-badge" title={`${match_score} shared preferences`}>
            {match_score} {match_score === 1 ? "Match" : "Matches"}
          </span>
        )}
      </div>

      <p className="profile-occupation">{occupation}</p>

      {bio && <p className="profile-bio">"{bio}"</p>}

      {showMatchDetails && (
        <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {common_hobbies.length > 0 && (
            <div>
              <p className="section-label">Shared Hobbies</p>
              <div className="chips-wrapper">
                {common_hobbies.map((item) => (
                  <span key={item} className="chip chip-highlight">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {common_favourite_foods.length > 0 && (
            <div>
              <p className="section-label">Shared Foods</p>
              <div className="chips-wrapper">
                {common_favourite_foods.map((item) => (
                  <span key={item} className="chip chip-highlight">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {common_movie_genres.length > 0 && (
            <div>
              <p className="section-label">Shared Movie Genres</p>
              <div className="chips-wrapper">
                {common_movie_genres.map((item) => (
                  <span key={item} className="chip chip-highlight">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="profile-sections">
        <div>
          <p className="section-label">Hobbies</p>
          <div className="chips-wrapper">
            {hobbies.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label">Favourite Foods</p>
          <div className="chips-wrapper">
            {favourite_foods.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label">Movie Genres</p>
          <div className="chips-wrapper">
            {movie_genres.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {is_owner && (
        <div className="profile-card-actions">
          <Link to={`/profiles/${id}/edit`} className="btn btn-secondary btn-sm">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onDelete && onDelete(id)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </article>
  );
};

export default ProfileCard;
