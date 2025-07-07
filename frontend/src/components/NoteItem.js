import { useState } from "react";

const NoteItem = ({
  note,
  contactId,
  onNoteUpdate,
  onNoteDelete,
  highlight,
  highlightText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditClick = () => {
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      console.log("Sending note update request:", {
        noteId: note.id,
        content: editContent,
      });
      await onNoteUpdate(note.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to update note";
      alert(`Failed to update note: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await onNoteDelete(note.id);
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note");
      }
    }
  };

  const formatDate = (dateString) => {
    // The dateString is in UTC format like "2025-07-04 00:03:57"
    // We need to parse it as UTC and convert to PST
    const utcDate = new Date(dateString + "Z"); // Add 'Z' to indicate UTC
    return utcDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Los_Angeles", // Convert to PST/PDT
    });
  };

  return (
    <div
      style={{ borderTop: "1px solid #ccc", padding: "8px 0" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <strong style={{ fontSize: "16px", color: "#2c3e50" }}>
          {formatDate(note.created_at)}
        </strong>
        {isHovered && (
          <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
            <button
              onClick={handleEditClick}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px",
                color: "#666",
              }}
              title="Edit note"
            >
              ✏️
            </button>
            <button
              onClick={handleDeleteClick}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                padding: "2px",
                color: "#666",
              }}
              title="Delete note"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div style={{ marginTop: "8px" }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={handleSaveEdit}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                background: "#f44336",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            lineHeight: "1.5",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {highlightText
            ? highlightText(note.content, highlight)
            : note.content}
        </div>
      )}
    </div>
  );
};

export default NoteItem;
