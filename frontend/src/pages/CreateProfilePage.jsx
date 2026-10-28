import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../utils/errors";
import ProfileForm from "../components/ProfileForm";

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [existingProfileId, setExistingProfileId] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerErrors({});
    setServerMessage("");
    setExistingProfileId(null);

    try {
      await createClient(formData);
      await refreshUser();
      navigate("/profiles");
    } catch (err) {
      const { fieldErrors, message } = extractApiError(err);
      setServerErrors(fieldErrors);
      setServerMessage(message || "Failed to create profile.");

      if (err.response?.data?.profile_id) {
        setExistingProfileId(err.response.data.profile_id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ProfileForm
        initialValues={{
          name: user?.name || "",
          age: "",
          gender: "male",
          occupation: "",
          bio: "",
          hobbies: [],
          favourite_foods: [],
          movie_genres: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={false}
        serverErrors={serverErrors}
        serverMessage={serverMessage}
        existingProfileId={existingProfileId}
      />
    </div>
  );
};

export default CreateProfilePage;
