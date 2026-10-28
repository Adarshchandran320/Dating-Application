export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  // Standard RFC 5322 regex approximation for common emails
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const required = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const validateSignup = ({ name, email, password, confirm_password }) => {
  const errors = {};

  if (!required(name)) {
    errors.name = "Name is required.";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!required(email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!required(password)) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (!required(confirm_password)) {
    errors.confirm_password = "Confirm password is required.";
  } else if (password !== confirm_password) {
    errors.confirm_password = "Passwords do not match.";
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!required(email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!required(password)) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateProfile = ({
  name,
  age,
  gender,
  occupation,
  hobbies,
  favourite_foods,
  movie_genres,
}) => {
  const errors = {};

  if (!required(name)) {
    errors.name = "Name is required.";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  const ageNum = Number(age);
  if (!age || isNaN(ageNum) || !Number.isInteger(ageNum)) {
    errors.age = "Age must be an integer.";
  } else if (ageNum < 18 || ageNum > 99) {
    errors.age = "Age must be between 18 and 99.";
  }

  if (!required(gender)) {
    errors.gender = "Gender is required.";
  }

  if (!required(occupation)) {
    errors.occupation = "Occupation is required.";
  }

  if (!hobbies || hobbies.length < 1) {
    errors.hobbies = "Please add at least one hobby.";
  } else if (hobbies.length > 15) {
    errors.hobbies = "Maximum 15 hobbies allowed.";
  }

  if (!favourite_foods || favourite_foods.length < 1) {
    errors.favourite_foods = "Please add at least one favourite food.";
  } else if (favourite_foods.length > 15) {
    errors.favourite_foods = "Maximum 15 favourite foods allowed.";
  }

  if (!movie_genres || movie_genres.length < 1) {
    errors.movie_genres = "Please add at least one movie genre.";
  } else if (movie_genres.length > 15) {
    errors.movie_genres = "Maximum 15 movie genres allowed.";
  }

  return errors;
};
