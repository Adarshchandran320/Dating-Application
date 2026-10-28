import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FormField from "./FormField";
import TagInput from "./TagInput";
import Alert from "./Alert";
import { GENDER_OPTIONS } from "../utils/constants";
import { validateProfile } from "../utils/validators";
import { getHobbies, getFoods, getGenres } from "../api/endpoints";

const ProfileForm = ({
  initialValues = {
    name: "",
    age: "",
    gender: "male",
    occupation: "",
    bio: "",
    hobbies: [],
    favourite_foods: [],
    movie_genres: [],
  },
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  serverErrors = {},
  serverMessage = "",
  existingProfileId = null,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [clientErrors, setClientErrors] = useState({});
  const [suggestions, setSuggestions] = useState({
    hobbies: [],
    foods: [],
    genres: [],
  });

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  useEffect(() => {
    // Fetch tag lookups
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
        // Tag lookups are non-blocking suggestions
      }
    };

    fetchSuggestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTagsChange = (field, tags) => {
    setFormData((prev) => ({ ...prev, [field]: tags }));
    if (clientErrors[field]) {
      setClientErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateProfile(formData);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }
    setClientErrors({});
    onSubmit(formData);
  };

  const getFieldError = (field) => {
    return clientErrors[field] || serverErrors[field];
  };

  return (
    <div className="card shadow-sm rounded-4 border p-4 p-md-5 mx-auto" style={{ maxWidth: "720px" }}>
      <h2 className="h4 fw-bold text-dark mb-4">
        {isEdit ? "Edit Your Profile" : "Create Your Dating Profile"}
      </h2>

      {serverMessage && (
        <Alert
          type={existingProfileId ? "warning" : "danger"}
          message={
            <div>
              <span>{serverMessage} </span>
              {existingProfileId && (
                <Link
                  to={`/profiles/${existingProfileId}/edit`}
                  className="fw-bold text-decoration-underline"
                >
                  Click here to edit your existing profile.
                </Link>
              )}
            </div>
          }
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <FormField
              id="profile-name"
              label="Full Name"
              required
              error={getFieldError("name")}
            >
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jordan Lee"
              />
            </FormField>
          </div>

          <div className="col-12 col-md-6">
            <FormField
              id="profile-age"
              label="Age"
              required
              error={getFieldError("age")}
            >
              <input
                type="number"
                name="age"
                min="18"
                max="99"
                className="form-control"
                value={formData.age}
                onChange={handleChange}
                placeholder="18 - 99"
              />
            </FormField>
          </div>

          <div className="col-12 col-md-6">
            <FormField
              id="profile-gender"
              label="Gender"
              required
              error={getFieldError("gender")}
            >
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="col-12">
            <FormField
              id="profile-occupation"
              label="Occupation"
              required
              error={getFieldError("occupation")}
            >
              <input
                type="text"
                name="occupation"
                className="form-control"
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. UX Designer / Student"
              />
            </FormField>
          </div>

          <div className="col-12">
            <FormField
              id="profile-bio"
              label="About Me (Bio)"
              hint="Max 500 characters. Tell others about your passions and personality."
              error={getFieldError("bio")}
            >
              <textarea
                name="bio"
                rows="3"
                maxLength="500"
                value={formData.bio}
                onChange={handleChange}
                className="form-control"
                placeholder="I love weekend road trips, indie games, and good conversation..."
              />
            </FormField>
          </div>

          <div className="col-12">
            <TagInput
              id="profile-hobbies"
              label="Hobbies"
              required
              tags={formData.hobbies}
              onChange={(tags) => handleTagsChange("hobbies", tags)}
              suggestions={suggestions.hobbies}
              error={getFieldError("hobbies")}
              placeholder="Type a hobby and press Enter (e.g. hiking, gaming)"
            />
          </div>

          <div className="col-12">
            <TagInput
              id="profile-foods"
              label="Favourite Foods"
              required
              tags={formData.favourite_foods}
              onChange={(tags) => handleTagsChange("favourite_foods", tags)}
              suggestions={suggestions.foods}
              error={getFieldError("favourite_foods")}
              placeholder="Type a favourite food and press Enter (e.g. sushi, tacos)"
            />
          </div>

          <div className="col-12">
            <TagInput
              id="profile-genres"
              label="Preferred Movie Genres"
              required
              tags={formData.movie_genres}
              onChange={(tags) => handleTagsChange("movie_genres", tags)}
              suggestions={suggestions.genres}
              error={getFieldError("movie_genres")}
              placeholder="Type a movie genre and press Enter (e.g. sci-fi, comedy)"
            />
          </div>

          <div className="col-12 d-flex justify-content-end gap-2 mt-4">
            <Link to="/profiles" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              )}
              {isSubmitting
                ? "Saving Profile..."
                : isEdit
                  ? "Update Profile"
                  : "Create Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
