import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../api/endpoints";
import ProfileCard from "../components/ProfileCard";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import { extractApiError } from "../utils/errors";

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError("");
    setNeedsProfile(false);
    try {
      const res = await getMatches();
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMatches(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setNeedsProfile(true);
      } else {
        const { message } = extractApiError(err);
        setError(message || "Failed to load match suggestions.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (needsProfile) {
    return (
      <EmptyState
        icon="✨"
        title="Create a profile to see matches"
        description="To calculate match recommendations, we need to know your hobbies, favourite foods, and movie genres."
        action={
          <Link to="/profiles/new" className="btn btn-primary">
            Create Your Profile Now
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-dark mb-1">Dating Match Suggestions</h1>
        <p className="text-body-secondary small mb-0">
          Ranked by shared hobbies, favourite foods, and movie genres
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="danger" message={error} />
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={fetchMatches}
          >
            Retry
          </button>
        </div>
      )}

      {loading && <Loader message="Finding your best matches..." />}

      {!loading && !error && matches.length === 0 && (
        <EmptyState
          icon="💔"
          title="No matches found yet"
          description="Try adding more hobbies, favourite foods, or movie genres to your profile to broaden your match overlap."
          action={
            <Link to="/profiles" className="btn btn-outline-secondary">
              Browse All Profiles
            </Link>
          }
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div>
          <p className="text-body-secondary small mb-3">
            Found {matches.length} {matches.length === 1 ? "match" : "matches"} with overlapping preferences:
          </p>
          <div className="row g-4">
            {matches.map((profile) => (
              <div key={profile.id} className="col-12 col-md-6 col-xl-4">
                <ProfileCard
                  profile={profile}
                  showMatchDetails={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

