import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { listClients, deleteClient } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../utils/errors";
import ProfileCard from "../components/ProfileCard";
import Loader from "../components/Loader";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

const ProfilesPage = () => {
  const { refreshUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listClients();
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setProfiles(data);
    } catch (err) {
      const { message } = extractApiError(err);
      setError(message || "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchProfiles();
    return () => {
      isMounted = false;
    };
  }, [fetchProfiles]);

  const handleDeleteRequest = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteClient(deleteTargetId);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setActionSuccess("Your profile was deleted successfully.");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Explore Members</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Browse dating profiles and discover shared interests
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link to="/filter" className="btn btn-secondary">
            Filter Profiles
          </Link>
          <Link to="/profiles/new" className="btn btn-primary">
            + Create Profile
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <Alert
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess("")}
        />
      )}

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert type="danger" message={error} />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchProfiles}
          >
            Retry
          </button>
        </div>
      )}

      {loading && <Loader message="Loading member profiles..." />}

      {!loading && !error && profiles.length === 0 && (
        <EmptyState
          icon="👥"
          title="No profiles available yet."
          description="Be the first to create your profile and kickstart the community!"
          action={
            <Link to="/profiles/new" className="btn btn-primary">
              Create My Profile
            </Link>
          }
        />
      )}

      {!loading && !error && profiles.length > 0 && (
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
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Your Profile?"
        message="Are you sure you want to delete your profile? This cannot be undone and you will need to create a new profile to see match suggestions."
        confirmText="Yes, Delete Profile"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default ProfilesPage;
