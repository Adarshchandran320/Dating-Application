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
    let isMounted = true;
    fetchMatches();
    return () => {
      isMounted = false;
    };
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
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Dating Match Suggestions</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Ranked by shared hobbies, favourite foods, and movie genres
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert type="danger" message={error} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
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
            <Link to="/profiles" className="btn btn-secondary">
              Browse All Profiles
            </Link>
          }
        />
      )}

      {!loading && !error && matches.length > 0 && (
        <div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Found {matches.length} {matches.length === 1 ? "match" : "matches"} with overlapping preferences:
          </p>
          <div className="cards-grid">
            {matches.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                showMatchDetails={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
