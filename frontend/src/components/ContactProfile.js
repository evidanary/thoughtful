import { useEffect, useState } from "react";
import {
  getContact,
  addNote,
  addTag,
  updateContact,
  deleteTag,
  updateNote,
  deleteNote,
} from "../api/contacts";
import NoteItem from "./NoteItem";

// Utility to get query param
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || "";
}

// Utility to highlight all occurrences of a substring (case-insensitive, multi-word)
function highlightText(text, highlight) {
  if (!highlight) return text;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ background: "#FFFF66", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const ContactProfile = ({ contactId }) => {
  const [contact, setContact] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const highlight = getQueryParam("highlight");

  useEffect(() => {
    getContact(contactId).then(setContact);
  }, [contactId]);

  const handleAddNote = async () => {
    await addNote(contactId, newNote);
    const updated = await getContact(contactId);
    setContact(updated);
    setNewNote("");
  };

  const handleAddTag = async () => {
    await addTag(contactId, newTag);
    const updated = await getContact(contactId);
    setContact(updated);
    setNewTag("");
  };

  const handleDeleteTag = async (tagName) => {
    try {
      await deleteTag(contactId, tagName);
      const updated = await getContact(contactId);
      setContact(updated);
    } catch (error) {
      console.error("Error deleting tag:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to delete tag";
      alert(`Failed to delete tag: ${errorMessage}`);
    }
  };

  const handleNoteUpdate = async (noteId, content) => {
    try {
      console.log("Updating note in ContactProfile:", { noteId, content });
      await updateNote(contactId, noteId, content);
      const updated = await getContact(contactId);
      setContact(updated);
    } catch (error) {
      console.error("Error updating note in ContactProfile:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to update note";
      throw new Error(errorMessage);
    }
  };

  const handleNoteDelete = async (noteId) => {
    await deleteNote(contactId, noteId);
    const updated = await getContact(contactId);
    setContact(updated);
  };

  const handleEditClick = () => {
    setEditData({
      name: contact.name,
      email: contact.email,
      linkedin: contact.linkedin,
      company: contact.company,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      console.log("Sending update request with data:", editData);
      await updateContact(contactId, editData);
      const updated = await getContact(contactId);
      setContact(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating contact:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update contact";
      alert(`Failed to update contact: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  if (!contact) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", padding: 20 }}>
      {/* Left panel */}
      <div
        style={{
          width: "30%",
          paddingRight: 20,
          borderRight: "1px solid #ccc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2>{highlightText(contact.name, highlight)}</h2>
          <button
            onClick={handleEditClick}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px",
            }}
            title="Edit contact"
          >
            ✏️
          </button>
        </div>

        {isEditing ? (
          <div>
            <div style={{ marginBottom: 10 }}>
              <label>Name:</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Email:</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>LinkedIn:</label>
              <input
                type="text"
                value={editData.linkedin}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Company:</label>
              <input
                type="text"
                value={editData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
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
                  padding: "8px 16px",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>Email: {highlightText(contact.email, highlight)}</p>
            <p>LinkedIn: {highlightText(contact.linkedin, highlight)}</p>
            <p>Company: {highlightText(contact.company, highlight)}</p>
          </div>
        )}

        <h4>Tags</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {contact.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "#eee",
                padding: "2px 6px",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {highlightText(tag, highlight)}
              <button
                onClick={() => handleDeleteTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666",
                  padding: "0 2px",
                  marginLeft: "2px",
                }}
                title="Delete tag"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="text"
            value={newTag}
            placeholder="Add tag"
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button onClick={handleAddTag}>Save</button>
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            style={{
              background: "#4285F4",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            onClick={() => {
              const email = encodeURIComponent(contact.email);
              const url = `https://mail.google.com/mail/u/0/#search/from:${email}+OR+to:${email}`;
              window.open(url, "_blank");
            }}
          >
            Search Emails
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, paddingLeft: 20 }}>
        <button
          style={{ float: "right", marginBottom: 10 }}
          onClick={() => {
            window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`;
          }}
        >
          Compose Email
        </button>

        <h3>Add Note</h3>
        <textarea
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 8 }}>
          <button onClick={handleAddNote}>Save</button>
        </div>

        <h3 style={{ marginTop: 24 }}>Interaction History</h3>
        {contact.notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            contactId={contactId}
            onNoteUpdate={handleNoteUpdate}
            onNoteDelete={handleNoteDelete}
            highlight={highlight}
            highlightText={highlightText}
          />
        ))}
      </div>
    </div>
  );
};

export default ContactProfile;
