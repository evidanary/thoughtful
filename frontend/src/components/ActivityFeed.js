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

const ActivityFeed = ({ activities, loading, error }) => {
  if (loading) return <div style={{ padding: 32 }}>Loading activity...</div>;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;
  if (!activities || activities.length === 0)
    return <div style={{ padding: 32 }}>No activity found.</div>;

  const renderActivityText = (activity) => {
    const contactLink = (
      <Link
        to={`/profile/${activity.contact_id}`}
        style={{
          color: "#4B0082",
          textDecoration: "none",
          fontWeight: 600,
        }}
        onMouseOver={(e) => (e.target.style.color = "#00BFFF")}
        onMouseOut={(e) => (e.target.style.color = "#4B0082")}
      >
        {activity.contact_name}
      </Link>
    );

    const parseMetadata = (metadata) => {
      if (!metadata) return {};
      try {
        return JSON.parse(metadata);
      } catch (error) {
        console.error("Error parsing activity metadata:", error, metadata);
        return {};
      }
    };

    switch (activity.activity_type) {
      case "contact_added":
        return <>Contact Added: {contactLink}</>;

      case "note_added":
        const noteData = parseMetadata(activity.metadata);
        const noteContent = noteData.content || "";
        return (
          <>
            Note added "{noteContent}" for {contactLink}
          </>
        );

      case "note_edited":
        const editedData = parseMetadata(activity.metadata);
        const editedContent = editedData.content || "";
        return (
          <>
            Note edited "{editedContent}" for {contactLink}
          </>
        );

      case "tag_added":
        const addedData = parseMetadata(activity.metadata);
        const addedTag = addedData.tag || "";
        return (
          <>
            Tag "{addedTag}" added for {contactLink}
          </>
        );

      case "tag_removed":
        const removedData = parseMetadata(activity.metadata);
        const removedTag = removedData.tag || "";
        return (
          <>
            Tag "{removedTag}" removed for {contactLink}
          </>
        );

      default:
        return (
          <>
            {activity.description} for {contactLink}
          </>
        );
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 0" }}>
      <h2 style={{ marginBottom: 24 }}>Activity Feed</h2>
      {activities.map((activity) => (
        <div
          key={activity.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: "16px 0",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#888",
              minWidth: 80,
              textAlign: "right",
            }}
          >
            {getRelativeTime(activity.created_at)}
          </div>
          <div
            style={{
              flex: 1,
              fontSize: 14,
              color: "#333",
              lineHeight: 1.4,
            }}
          >
            {renderActivityText(activity)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
