import React, { useState, useEffect, useRef } from "react";
import { getAllTags } from "../api/tags";

const DATE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Last Year", value: 365 },
];

function getDateNDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function FilterBar({ filters, setFilters }) {
  // Tag dropdown state
  const [tags, setTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagDropdownRef = useRef();

  // Date dropdown state
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    getAllTags().then(setTags);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(e.target)
      ) {
        setTagDropdownOpen(false);
      }
      setCreateDropdownOpen(false);
      setActivityDropdownOpen(false);
    }
    if (tagDropdownOpen || createDropdownOpen || activityDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [tagDropdownOpen, createDropdownOpen, activityDropdownOpen]);

  // Filtered tags for search
  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  // Handlers
  const handleTagSelect = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const handleDateSelect = (type, days) => {
    const dateKey = type === "create" ? "created_after" : "last_activity_after";
    setFilters((prev) => ({
      ...prev,
      [dateKey]: getDateNDaysAgo(days),
    }));
  };

  return (
    <div style={{ display: "flex", gap: 24, marginBottom: 5 }}>
      {/* Tags Filter */}
      <div style={{ position: "relative" }} ref={tagDropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTagDropdownOpen((open) => !open);
          }}
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 20,
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 80,
          }}
        >
          Tags <span style={{ fontSize: 12 }}>▼</span>
        </button>
        {tagDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 10,
              minWidth: 200,
              padding: 8,
            }}
          >
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              style={{
                width: "100%",
                marginBottom: 8,
                padding: 6,
                borderRadius: 4,
                border: "1px solid #eee",
              }}
            />
            <div style={{ maxHeight: 150, overflowY: "auto" }}>
              {filteredTags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  style={{
                    padding: "6px 8px",
                    cursor: "pointer",
                    background: filters.tags?.includes(tag)
                      ? "#4B0082"
                      : "#fff",
                    color: filters.tags?.includes(tag) ? "#fff" : "#333",
                    borderRadius: 4,
                    marginBottom: 2,
                  }}
                >
                  {tag}
                </div>
              ))}
              {filteredTags.length === 0 && (
                <div style={{ color: "#bbb", padding: 8 }}>No tags found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Date Filter */}
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCreateDropdownOpen((open) => !open);
          }}
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 20,
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 120,
          }}
        >
          Create Date <span style={{ fontSize: 12 }}>▼</span>
        </button>
        {createDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 10,
              minWidth: 180,
              padding: 8,
            }}
          >
            {DATE_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleDateSelect("create", opt.value)}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  background:
                    filters.created_after === getDateNDaysAgo(opt.value)
                      ? "#4B0082"
                      : "#fff",
                  color:
                    filters.created_after === getDateNDaysAgo(opt.value)
                      ? "#fff"
                      : "#333",
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Date Filter */}
      <div style={{ position: "relative" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActivityDropdownOpen((open) => !open);
          }}
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 20,
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 120,
          }}
        >
          Activity Date <span style={{ fontSize: 12 }}>▼</span>
        </button>
        {activityDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              zIndex: 10,
              minWidth: 180,
              padding: 8,
            }}
          >
            {DATE_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleDateSelect("activity", opt.value)}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  background:
                    filters.last_activity_after === getDateNDaysAgo(opt.value)
                      ? "#4B0082"
                      : "#fff",
                  color:
                    filters.last_activity_after === getDateNDaysAgo(opt.value)
                      ? "#fff"
                      : "#333",
                  borderRadius: 4,
                  marginBottom: 2,
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
