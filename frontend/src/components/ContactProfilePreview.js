import { Link } from "react-router-dom";

function formatDate(dateString) {
  if (!dateString) return "";
  const utcDate = new Date(dateString + "Z");
  return utcDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  });
}

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const then = new Date(dateString + "Z");
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`;
  if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`;
  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`;
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (minutes > 0)
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  return "just now";
}

const ContactProfilePreview = ({
  contact,
  condensed = false,
  showCheckbox = false,
  isSelected = false,
  onSelect,
}) => {
  // Use flat note fields from backend
  const mostRecentNote = contact.note_content || "";
  const NOTE_PREVIEW_CHAR_COUNT = 1000;
  const notePreview =
    mostRecentNote.length > NOTE_PREVIEW_CHAR_COUNT
      ? mostRecentNote.slice(0, NOTE_PREVIEW_CHAR_COUNT) + "…"
      : mostRecentNote;
  const noteDate = contact.note_created_at
    ? formatDate(contact.note_created_at)
    : null;
  const lastUpdated =
    contact.updated_at ||
    (contact.notes && contact.notes[0]?.updated_at) ||
    contact.created_at;
  const lastUpdatedExact = lastUpdated ? formatDate(lastUpdated) : null;
  const lastUpdatedRelative = lastUpdated ? getRelativeTime(lastUpdated) : null;

  return (
    <div
      style={{
        borderBottom: condensed ? "none" : "1px solid #eee",
        padding: condensed ? "12px 0" : "24px 0 16px 0",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
          {/* Checkbox for condensed view */}
          {showCheckbox && (
            <div
              style={{
                marginRight: "8px",
                display: "flex",
                alignItems: "center",
                paddingTop: "1px", // Slight adjustment to align with text
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect && onSelect(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                }}
              />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              to={`/profile/${contact.id}`}
              style={{
                fontSize: condensed ? 14 : 22,
                fontWeight: 600,
                color: "#4B0082",
                textDecoration: "none",
                transition: "color 0.2s",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
              onMouseOver={(e) => (e.target.style.color = "#00BFFF")}
              onMouseOut={(e) => (e.target.style.color = "#4B0082")}
            >
              {contact.name}
            </Link>
            {/* Last Updated and Contact Info */}
            <div
              style={{
                fontSize: 13,
                color: "#666",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              {lastUpdatedRelative && (
                <span
                  style={{
                    color: "#888",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    height: "20px", // Fixed height for consistency
                  }}
                  title={lastUpdatedExact}
                >
                  {lastUpdatedRelative}
                </span>
              )}
              {contact.company && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "20px",
                  }}
                >
                  🏢 {contact.company}
                </span>
              )}
              {contact.email && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "20px",
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "#4B0082",
                  }}
                  onClick={() => {
                    const email = encodeURIComponent(contact.email);
                    const url = `https://mail.google.com/mail/u/0/#search/from:${email}+OR+to:${email}`;
                    window.open(url, "_blank");
                  }}
                  title="Search emails with this contact"
                >
                  📧 {contact.email}
                </span>
              )}
              {contact.linkedin && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "20px",
                  }}
                >
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#0077b5",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                    title={contact.linkedin}
                  >
                    💼 LinkedIn
                  </a>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tags section on the right */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            maxWidth: "38%",
            justifyContent: "flex-end",
          }}
        >
          {contact.tags &&
            contact.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "#eee",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#333",
                  marginLeft: 2,
                }}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>
      {/* Notes section - only show if not condensed */}
      {!condensed && (
        <div
          style={{
            marginTop: 10,
            color: "#666",
            fontSize: 13,
            minHeight: 24,
            maxHeight: 120,
            overflow: "hidden",
            whiteSpace: "pre-wrap",
          }}
        >
          {mostRecentNote ? (
            <>
              <b>{noteDate}</b>
              {": "}
              {notePreview}
            </>
          ) : (
            <span style={{ color: "#bbb" }}>(No notes yet)</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactProfilePreview;
