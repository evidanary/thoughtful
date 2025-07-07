import { useState } from "react";
import AddContactModal from "./AddContactModal";
import { Link } from "react-router-dom";
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
  const [showModal, setShowModal] = useState(false);

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
        <Link to="/" style={{ textDecoration: "none" }}>
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
        </Link>
      </div>

      {/* Right side - Search and Add Contact */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flex: "0 0 400px",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
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
        <button
          style={{
            background: "#4B0082",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}
          onClick={() => setShowModal(true)}
        >
          Add Contact
        </button>
        {showModal && <AddContactModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
};

export default TitleBar;
