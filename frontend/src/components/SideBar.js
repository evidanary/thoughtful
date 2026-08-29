import { useState, useEffect } from "react";
import AddContactModal from "./AddContactModal";
import QuickAddModal from "./QuickAddModal";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser, signOut, displayName } from "../api/auth";
/**
 *  Brand Gradient Color Meaning:
  - Outlasting the competition: Indigo (#4B0082)
    Symbolizes durability, strategy, and wisdom — often linked to longevity and vision. A deep, enduring base color.
  - Being thoughtful: Rose Quartz (#FFB6C1)
    Soft pink conveys warmth, empathy, and sincerity — the emotional driver behind genuine relationships.
  - Being useful: Sky Blue (#00BFFF)
    Clear, practical, and open — blue is universally associated with utility, trust, and reliability.
 */

const NAV_ITEMS = [
  { to: "/", icon: "👥", label: "Contacts", exact: true },
  { to: "/campaigns", icon: "🎯", label: "Campaigns" },
  { to: "/milestones", icon: "🏆", label: "Milestones" },
  { to: "/email-templates", icon: "✉️", label: "Email Templates" },
  { to: "/action-items", icon: "⚡", label: "Action Items" },
  { to: "/tags", icon: "🏷️", label: "Tags" },
  { to: "/quick-notes", icon: "📋", label: "Inbox" },
  { to: "/social-media", icon: "📱", label: "Social Media" },
  { to: "/stamina-viz", icon: "🌐", label: "Stamina Viz" },
];

const SideBar = ({ onShowBulkEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Keep input in sync with URL ?q param
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
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

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  return (
    <div
      style={{
        width: 232,
        flexShrink: 0,
        height: "100vh",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e0e0e0",
        boxShadow: "2px 0 4px rgba(0,0,0,0.04)",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        overflowY: "auto",
      }}
    >
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
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

      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search… (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{
            width: "100%",
            padding: "9px 12px",
            fontSize: "13px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#4B0082";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
        />
      </form>

      {/* Primary actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={filledButton} onClick={() => setShowModal(true)}>
          Add Contact
        </button>
        <button style={outlineButton} onClick={() => setShowQuickAdd(true)}>
          <span style={{ fontSize: 15 }}>⚡</span> Quick Add
        </button>
        <button
          style={outlineButton}
          onClick={() => {
            if (onShowBulkEmail) onShowBulkEmail();
          }}
        >
          <span style={{ fontSize: 15 }}>📧</span> Bulk Email
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: active ? "#4B0082" : "#555",
                background: active ? "#f3eaff" : "transparent",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                padding: "9px 12px",
                borderRadius: 6,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Who is signed in, and the way out */}
      {user && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#4B0082",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {displayName(user.email).charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>
              {displayName(user.email)}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#aaa",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: 14,
              padding: 2,
            }}
          >
            ⏻
          </button>
        </div>
      )}

      {showModal && <AddContactModal onClose={() => setShowModal(false)} />}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
};

const filledButton = {
  background: "#4B0082",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "10px 14px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
};

const outlineButton = {
  background: "#fff",
  color: "#4B0082",
  border: "2px solid #4B0082",
  borderRadius: 6,
  padding: "8px 14px",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
};

export default SideBar;
