import { useState, useEffect, useRef } from "react";
import AddContactModal from "./AddContactModal";
import QuickAddModal from "./QuickAddModal";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
/**
 *  Brand Gradient Color Meaning:
  - Outlasting the competition: Indigo (#4B0082)
    Symbolizes durability, strategy, and wisdom — often linked to longevity and vision. A deep, enduring base color.
  - Being thoughtful: Rose Quartz (#FFB6C1)
    Soft pink conveys warmth, empathy, and sincerity — the emotional driver behind genuine relationships.
  - Being useful: Sky Blue (#00BFFF)
    Clear, practical, and open — blue is universally associated with utility, trust, and reliability.
 */

const TitleBar = ({ onShowBulkEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Keep input in sync with URL ?q param
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      e.target.blur();
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuItemClick = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

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
      {/* Left side - Brand and Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
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

        {/* Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            to="/milestones"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              color: "#4B0082",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>🏆</span>
            <span>Milestones</span>
          </Link>

          <Link
            to="/email-templates"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              color: "#4B0082",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>✉️</span>
            <span>Email Templates</span>
          </Link>

          <Link
            to="/action-items"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              color: "#4B0082",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>⚡</span>
            <span>Action Items</span>
          </Link>

          <Link
            to="/tags"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              color: "#4B0082",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>🏷️</span>
            <span>Tags</span>
          </Link>

          <Link
            to="/quick-notes"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              textDecoration: "none",
              color: "#4B0082",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <span style={{ fontSize: "16px" }}>📋</span>
            <span>Inbox</span>
          </Link>
        </div>
      </div>

      {/* Right side - Search, Add Contact, and Hamburger Menu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flex: "0 0 720px",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search contacts, notes… (Enter)"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
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
              e.target.style.borderColor = "#4B0082";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#ddd";
            }}
          />
        </form>
        <button
          style={{
            background: "#fff",
            color: "#4B0082",
            border: "2px solid #4B0082",
            borderRadius: 6,
            padding: "9px 16px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onClick={() => setShowQuickAdd(true)}
        >
          <span style={{ fontSize: 16 }}>⚡</span>
          Quick Add
        </button>
        <button
          style={{
            background: "#fff",
            color: "#4B0082",
            border: "2px solid #4B0082",
            borderRadius: 6,
            padding: "9px 16px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onClick={() => {
            if (onShowBulkEmail) {
              onShowBulkEmail();
            }
          }}
        >
          <span style={{ fontSize: 16 }}>📧</span>
          Bulk Email
        </button>
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
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onClick={() => setShowModal(true)}
        >
          Add Contact
        </button>

        {/* Hamburger Menu Button */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
            onClick={handleMenuToggle}
          >
            <div
              style={{
                width: "24px",
                height: "3px",
                backgroundColor: "#4B0082",
                borderRadius: "2px",
                transition: "transform 0.3s ease",
                transform: showMenu
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <div
              style={{
                width: "24px",
                height: "3px",
                backgroundColor: "#4B0082",
                borderRadius: "2px",
                transition: "opacity 0.3s ease",
                opacity: showMenu ? 0 : 1,
              }}
            />
            <div
              style={{
                width: "24px",
                height: "3px",
                backgroundColor: "#4B0082",
                borderRadius: "2px",
                transition: "transform 0.3s ease",
                transform: showMenu
                  ? "rotate(-45deg) translate(7px, -6px)"
                  : "none",
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "200px",
                zIndex: 1000,
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                }}
                onClick={() => handleMenuItemClick("/social-media")}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "16px" }}>📱</span>
                  <span style={{ fontWeight: 500 }}>Social Media</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {showModal && <AddContactModal onClose={() => setShowModal(false)} />}
        {showQuickAdd && (
          <QuickAddModal onClose={() => setShowQuickAdd(false)} />
        )}
      </div>
    </div>
  );
};

export default TitleBar;
