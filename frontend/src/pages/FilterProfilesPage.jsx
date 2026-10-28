import React, { useState, useEffect, useCallback } from "react";
import { listClients, deleteClient, getHobbies, getFoods, getGenres } from "../api/endpoints";
import { GENDER_OPTIONS } from "../utils/constants";
import { extractApiError } from "../utils/errors";
import ProfileCard from "../components/ProfileCard";
import TagInput from "../components/TagInput";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

const FilterProfilesPage = () => {
  const { refreshUser } = useAuth();

  // Filter Form State
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [gender, setGender] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [favouriteFoods, setFavouriteFoods] = useState([]);
  const [movieGenres, setMovieGenres] = useState([]);

  // Tag lookups for suggestions
  const [suggestions, setSuggestions] = useState({
    hobbies: [],
    foods: [],
    genres: [],
  });

  // Results & UI State
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tag suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const [hRes, fRes, gRes] = await Promise.all([
          getHobbies(),
          getFoods(),
          getGenres(),
        ]);
        setSuggestions({
          hobbies: Array.isArray(hRes.data) ? hRes.data : hRes.data?.results || [],
          foods: Array.isArray(fRes.data) ? fRes.data : fRes.data?.results || [],
          genres: Array.isArray(gRes.data) ? gRes.data : gRes.data?.results || [],
        });
      } catch {
        // Non-blocking
      }
    };
    fetchSuggestions();
  }, []);

  const executeSearch = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await listClients(params);
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setProfiles(data);
    } catch (err) {
      const { message } = extractApiError(err);
      setError(message || "Failed to filter profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: show all profiles
  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setFilterError("");

    const params = {};

    if (minAge) {
      const minNum = Number(minAge);
      if (isNaN(minNum) || !Number.isInteger(minNum) || minNum < 18 || minNum > 99) {
        setFilterError("Min age must be an integer between 18 and 99.");
        return;
      }
      params.min_age = minNum;
    }

    if (maxAge) {
      const maxNum = Number(maxAge);
      if (isNaN(maxNum) || !Number.isInteger(maxNum) || maxNum < 18 || maxNum > 99) {
        setFilterError("Max age must be an integer between 18 and 99.");
        return;
      }
      params.max_age = maxNum;
    }

    if (minAge && maxAge && Number(minAge) > Number(maxAge)) {
      setFilterError("Minimum age cannot be greater than maximum age.");
      return;
    }

    if (gender) {
      params.gender = gender;
    }

    if (hobbies.length > 0) {
      params.hobbies = hobbies.join(",");
    }

    if (favouriteFoods.length > 0) {
      params.favourite_foods = favouriteFoods.join(",");
    }

    if (movieGenres.length > 0) {
      params.movie_genres = movieGenres.join(",");
    }

    executeSearch(params);
  };

  const handleClearFilters = () => {
    setMinAge("");
    setMaxAge("");
    setGender("");
    setHobbies([]);
    setFavouriteFoods([]);
    setMovieGenres([]);
    setFilterError("");
    executeSearch({});
  };

  const handleDeleteRequest = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteClient(deleteTargetId);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
      await refreshUser();
    } catch (err) {
      const { message } = extractApiError(err);
      setError(message || "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Search & Filter Profiles</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Find matches based on age ranges, gender, and shared passions
        </p>
      </div>

      <div className="filter-panel">
        <form onSubmit={handleApplyFilters} noValidate>
          {filterError && <Alert type="danger" message={filterError} />}

          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="filter-min-age" className="form-label">
                Min Age
              </label>
              <input
                id="filter-min-age"
                type="number"
                min="18"
                max="99"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                placeholder="18"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="filter-max-age" className="form-label">
                Max Age
              </label>
              <input
                id="filter-max-age"
                type="number"
                min="18"
                max="99"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                placeholder="99"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="filter-gender" className="form-label">
                Gender
              </label>
              <select
                id="filter-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
              >
                <option value="">Any Gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <TagInput
              id="filter-hobbies"
              label="Hobbies (Match Any)"
              tags={hobbies}
              onChange={setHobbies}
              suggestions={suggestions.hobbies}
              placeholder="e.g. hiking, gaming"
            />

            <TagInput
              id="filter-foods"
              label="Favourite Foods (Match Any)"
              tags={favouriteFoods}
              onChange={setFavouriteFoods}
              suggestions={suggestions.foods}
              placeholder="e.g. sushi, tacos"
            />

            <TagInput
              id="filter-genres"
              label="Movie Genres (Match Any)"
              tags={movieGenres}
              onChange={setMovieGenres}
              suggestions={suggestions.genres}
              placeholder="e.g. comedy, sci-fi"
            />
          </div>

          <div className="filter-actions" style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert type="danger" message={error} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => executeSearch({})}
          >
            Retry
          </button>
        </div>
      )}

      {loading && <Loader message="Filtering profiles..." />}

      {!loading && !error && profiles.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No profiles match your filters."
          description="Try broadening your age range or selecting different hobbies, foods, or genres."
          action={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearFilters}
            >
              Reset Filters
            </button>
          }
        />
      )}

      {!loading && !error && profiles.length > 0 && (
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Found {profiles.length} {profiles.length === 1 ? "profile" : "profiles"} matching your criteria:
          </p>
          <div className="cards-grid">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onDelete={handleDeleteRequest}
                isDeleting={isDeleting && deleteTargetId === profile.id}
              />
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Profile?"
        message="Are you sure you want to delete your profile? This cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FilterProfilesPage;
