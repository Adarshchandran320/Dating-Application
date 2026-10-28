export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-Binary" },
  { value: "other", label: "Other" },
];

export const getGenderLabel = (value) => {
  const match = GENDER_OPTIONS.find((opt) => opt.value === value);
  return match ? match.label : value;
};
