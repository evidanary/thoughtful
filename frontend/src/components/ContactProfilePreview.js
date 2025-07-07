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

const ContactProfilePreview = ({ contact }) => {
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
        borderBottom: "1px solid #eee",
        padding: "24px 0 16px 0",
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
          justifyContent: "space-between",
        }}
      >
        <div style={{ maxWidth: "60%" }}>
          <Link
            to={`/profile/${contact.id}`}
            style={{
              fontSize: 22,
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
          {lastUpdatedRelative && (
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginTop: 2,
                cursor: "pointer",
                width: "fit-content",
              }}
              title={lastUpdatedExact}
            >
              {lastUpdatedRelative}
            </div>
          )}
        </div>
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
    </div>
  );
};

export default ContactProfilePreview;
