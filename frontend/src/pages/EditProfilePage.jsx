import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getClient, updateClient } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../utils/errors";
import ProfileForm from "../components/ProfileForm";
import Loader from "../components/Loader";
import Alert from "../components/Alert";

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [notOwner, setNotOwner] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setFetchError("");
      setNotOwner(false);
      try {
        const res = await getClient(id);
        if (!isMounted) return;

        if (res.data.is_owner === false) {
          setNotOwner(true);
          return;
        }

        setInitialData({
          name: res.data.name || "",
          age: res.data.age || "",
          gender: res.data.gender || "male",
          occupation: res.data.occupation || "",
          bio: res.data.bio || "",
          hobbies: res.data.hobbies || [],
          favourite_foods: res.data.favourite_foods || [],
          movie_genres: res.data.movie_genres || [],
        });
      } catch (err) {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setFetchError("Profile not found.");
        } else if (err.response?.status === 403) {
          setNotOwner(true);
        } else {
          const { message } = extractApiError(err);
          setFetchError(message || "Failed to load profile details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerErrors({});
    setServerMessage("");

    try {
      await updateClient(id, formData);
      await refreshUser();
      navigate("/profiles");
    } catch (err) {
      const { fieldErrors, message } = extractApiError(err);
      setServerErrors(fieldErrors);
      setServerMessage(message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your profile details..." />;
  }

  if (notOwner) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "3rem" }}>
        <Alert
          type="danger"
          message="You can only edit your own profile."
        />
        <Link to="/profiles" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Profiles
        </Link>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "3rem" }}>
        <Alert type="danger" message={fetchError} />
        <Link to="/profiles" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Profiles
        </Link>
      </div>
    );
  }

  return (
    <div>
      {initialData && (
        <ProfileForm
          initialValues={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={true}
          serverErrors={serverErrors}
          serverMessage={serverMessage}
        />
      )}
    </div>
  );
};

export default EditProfilePage;
