export const extractApiError = (error) => {
  if (!error.response) {
    return {
      fieldErrors: {},
      message: "Cannot reach the server. Please try again.",
    };
  }

  const { status, data } = error.response;
  const fieldErrors = {};
  let message = "";

  if (typeof data === "string") {
    message = data;
  } else if (data && typeof data === "object") {
    // If detail is present
    if (data.detail) {
      message = typeof data.detail === "string" ? data.detail : String(data.detail);
    }

    // Extract field-level errors
    for (const [key, val] of Object.entries(data)) {
      if (key === "detail") continue;
      if (Array.isArray(val)) {
        fieldErrors[key] = val.join(" ");
      } else if (typeof val === "string") {
        fieldErrors[key] = val;
      }
    }

    if (!message && Object.keys(fieldErrors).length > 0) {
      // Pick first field error or a general note
      message = Object.values(fieldErrors)[0];
    }
  }

  if (!message) {
    if (status === 400) message = "Please check your input and try again.";
    else if (status === 401) message = "Invalid email or password.";
    else if (status === 403) message = "You do not have permission to perform this action.";
    else if (status === 404) message = "Requested resource not found.";
    else if (status >= 500) message = "Internal server error. Please try again later.";
    else message = "An unexpected error occurred.";
  }

  return { fieldErrors, message };
};
