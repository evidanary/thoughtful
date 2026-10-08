import { useState, useEffect, useRef } from "react";
import AddContactModal from "./AddContactModal";
import QuickAddModal from "./QuickAddModal";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthConfig, getCurrentUser, signOut, displayName } from "../api/auth";
import { getCouncils } from "../api/tags";
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

const COUNCIL_PANEL_WIDTH = 240;

// Hover menu of councils (tags flagged as councils on the Tags page). Hovering a
// council opens a second menu of its members. The sidebar scrolls, which would clip
// an absolutely positioned flyout, so both menus are position: fixed.
const CouncilsMenu = () => {
  const [open, setOpen] = useState(false);
  const [councils, setCouncils] = useState(null);
  const [anchor, setAnchor] = useState(null);
  const [hovered, setHovered] = useState(null); // { id, top }
  const triggerRef = useRef(null);
  const closeTimer = useRef(null);

  const show = () => {
    clearTimeout(closeTimer.current);
    if (open) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setAnchor({ left: rect.right + 6, top: rect.top });
    setOpen(true);
    setHovered(null);
    getCouncils().then(setCouncils).catch(() => setCouncils([]));
  };

  // Short delay so the pointer can cross the gap between trigger and menus
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const close = () => {
    clearTimeout(closeTimer.current);
    setOpen(false);
  };

  const hoveredCouncil = hovered && (councils || []).find((c) => c.id === hovered.id);

  return (
    <div onMouseEnter={show} onMouseLeave={scheduleClose}>
      <div
        ref={triggerRef}
        onClick={() => (open ? close() : show())}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: open ? "#4B0082" : "#555",
          background: open ? "#f3eaff" : "transparent",
          fontSize: 14,
          fontWeight: open ? 600 : 500,
          padding: "9px 12px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 16 }}>🏛️</span>
        <span style={{ flex: 1 }}>Councils</span>
        <span style={{ fontSize: 10, color: "#aaa" }}>▸</span>
      </div>

      {open && anchor && (
        <div
          style={{
            ...councilPanel,
            left: anchor.left,
            top: Math.min(anchor.top, window.innerHeight - 320),
          }}
        >
          {councils === null ? (
            <div style={councilEmpty}>Loading…</div>
          ) : councils.length === 0 ? (
            <div style={councilEmpty}>
              No councils yet. Mark a tag as a council on the{" "}
              <Link to="/tags" onClick={close} style={{ color: "#4B0082" }}>
                Tags page
              </Link>
              .
            </div>
          ) : (
            councils.map((council) => {
              const active = hovered?.id === council.id;
              const count = council.members.length;
              return (
                <div
                  key={council.id}
                  onMouseEnter={(e) =>
                    setHovered({ id: council.id, top: e.currentTarget.getBoundingClientRect().top })
                  }
                  title={council.description || undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 13,
                    cursor: "default",
                    color: active ? "#4B0082" : "#333",
                    background: active ? "#f3eaff" : "transparent",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {council.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: council.council_target && count >= council.council_target ? "#1a7f37" : "#999",
                    }}
                  >
                    {council.council_target ? `${count}/${council.council_target}` : count}
                  </span>
                  <span style={{ fontSize: 10, color: "#bbb" }}>▸</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {open && anchor && hoveredCouncil && (
        <div
          style={{
            ...councilPanel,
            left: anchor.left + COUNCIL_PANEL_WIDTH + 4,
            top: Math.max(8, Math.min(hovered.top - 6, window.innerHeight - 340)),
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, padding: "4px 12px 6px" }}>
            {hoveredCouncil.name}
          </div>
          {hoveredCouncil.members.length === 0 ? (
            <div style={councilEmpty}>
              Nobody yet. Add the "{hoveredCouncil.name}" tag to a contact.
            </div>
          ) : (
            hoveredCouncil.members.map((member) => (
              <Link
                key={member.id}
                to={`/profile/${member.id}`}
                onClick={close}
                style={{
                  display: "block",
                  padding: "7px 12px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "#333",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f6fc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#4B0082" }}>{member.name}</div>
                {member.company && <div style={{ fontSize: 11, color: "#999" }}>{member.company}</div>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const SideBar = ({ onShowBulkEmail }) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [user, setUser] = useState(null);
  const [authEnabled, setAuthEnabled] = useState(true);
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
    getAuthConfig()
      .then((cfg) => setAuthEnabled(cfg.authEnabled))
      .catch(() => setAuthEnabled(true));
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
        <CouncilsMenu />
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
          {authEnabled ? (
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
          ) : (
            <span
              title="Google sign-in is off because GOOGLE_CLIENT_ID is not set. The server reports a fixed local user, so there is no session to end."
              style={{
                fontSize: 9,
                color: "#bbb",
                border: "1px solid #eee",
                borderRadius: 4,
                padding: "2px 5px",
                whiteSpace: "nowrap",
              }}
            >
              dev
            </span>
          )}
        </div>
      )}

      {showModal && <AddContactModal onClose={() => setShowModal(false)} />}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
};

const councilPanel = {
  position: "fixed",
  width: COUNCIL_PANEL_WIDTH,
  maxHeight: 320,
  overflowY: "auto",
  boxSizing: "border-box",
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  padding: 6,
  zIndex: 1000,
};

const councilEmpty = {
  fontSize: 12,
  color: "#999",
  padding: "8px 12px",
  lineHeight: 1.5,
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
