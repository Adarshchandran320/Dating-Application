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
    <div className="form-group tag-input-container">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span style={{ color: "var(--primary)", marginLeft: "4px" }}>*</span>}
        </label>
      )}

      <div className="chips-wrapper" style={{ marginBottom: tags.length ? "8px" : "0" }}>
        {tags.map((tag, idx) => (
          <span key={tag} className="chip">
            {tag}
            <button
              type="button"
              className="chip-remove"
              onClick={() => removeTag(idx)}
              aria-label={`Remove ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="tag-input-box">
        <input
          id={id}
          type="text"
          value={inputValue}
          list={datalistId}
          placeholder={tags.length >= maxTags ? "Maximum tags reached" : placeholder}
          disabled={tags.length >= maxTags}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`form-input ${error ? "is-invalid" : ""}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
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
        <span id={errorId} className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default TagInput;
