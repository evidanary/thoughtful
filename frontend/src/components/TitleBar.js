import { useState } from "react";
/**
 *  Brand Gradient Color Meaning:
  - Outlasting the competition: Indigo (#4B0082)
    Symbolizes durability, strategy, and wisdom — often linked to longevity and vision. A deep, enduring base color.
  - Being thoughtful: Rose Quartz (#FFB6C1)
    Soft pink conveys warmth, empathy, and sincerity — the emotional driver behind genuine relationships.
  - Being useful: Sky Blue (#00BFFF)
    Clear, practical, and open — blue is universally associated with utility, trust, and reliability.
 */

const TitleBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* Left side - Brand */}
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: "bold",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: "linear-gradient(90deg, #4B0082, #FFB6C1, #00BFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Thoughtful
        </h1>
      </div>

      {/* Right side - Search */}
      <div style={{ flex: "0 0 300px" }}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3498db";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ddd";
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default TitleBar;
