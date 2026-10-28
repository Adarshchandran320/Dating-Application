import React, { useState } from "react";

const TagInput = ({
  id,
  label,
  tags = [],
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter or comma...",
  error,
  required = false,
  maxTags = 15,
}) => {
  const [inputValue, setInputValue] = useState("");
  const datalistId = `${id}-datalist`;
  const errorId = error ? `${id}-error` : undefined;

  const addTag = (raw) => {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return;
    if (tags.includes(cleaned)) {
      setInputValue("");
      return;
    }
    if (tags.length >= maxTags) {
      return;
    }
    onChange([...tags, cleaned]);
    setInputValue("");
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label fw-semibold">
          {label}
          {required && <span className="text-primary ms-1">*</span>}
        </label>
      )}

      {tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {tags.map((tag, idx) => (
            <span
              key={tag}
              className="badge rounded-pill text-bg-info text-dark d-inline-flex align-items-center py-2 px-3 fw-medium"
            >
              <span>{tag}</span>
              <button
                type="button"
                className="tag-remove-btn"
                onClick={() => removeTag(idx)}
                aria-label={`Remove ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="input-group">
        <input
          id={id}
          type="text"
          value={inputValue}
          list={datalistId}
          placeholder={
            tags.length >= maxTags ? "Maximum tags reached" : placeholder
          }
          disabled={tags.length >= maxTags}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`form-control ${error ? "is-invalid" : ""}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim() || tags.length >= maxTags}
        >
          Add
        </button>
      </div>

      {suggestions && suggestions.length > 0 && (
        <datalist id={datalistId}>
          {suggestions.map((item) => (
            <option key={item.id || item.name} value={item.name} />
          ))}
        </datalist>
      )}

      {error && (
        <div id={errorId} className="invalid-feedback d-block" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default TagInput;
