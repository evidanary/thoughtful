import { useEffect, useState } from "react";
import {
  getContact,
  addNote,
  addTag,
  updateContact,
  deleteTag,
  updateNote,
  deleteNote,
  deleteContact,
} from "../api/contacts";
import NoteItem from "./NoteItem";
import { useNavigate } from "react-router-dom";

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
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const highlight = getQueryParam("highlight");
  const navigate = useNavigate();

  useEffect(() => {
    getContact(contactId).then(setContact);
  }, [contactId]);

  // Close delete menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeleteMenu && !event.target.closest("[data-delete-menu]")) {
        setShowDeleteMenu(false);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDeleteMenu]);

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

  const handleDeleteContact = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${contact.name}"? This action cannot be undone and will also delete all associated notes and tags.`
    );

    if (confirmDelete) {
      try {
        console.log("Attempting to delete contact with ID:", contactId);
        await deleteContact(contactId);
        // Navigate back to the contact list
        navigate("/");
      } catch (error) {
        console.error("Error deleting contact:", error);
        console.error("Full error object:", error);
        console.error("Error response:", error.response);
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to delete contact";
        alert(`Failed to delete contact: ${errorMessage}`);
      }
    }
    setShowDeleteMenu(false);
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

        {/* Three-dot menu */}
        <div style={{ marginTop: 8, position: "relative" }} data-delete-menu>
          <button
            onClick={() => setShowDeleteMenu(!showDeleteMenu)}
            style={{
              background: "transparent",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: "6px 8px",
              cursor: "pointer",
              fontSize: "16px",
              color: "#666",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f8f9fa";
              e.target.style.borderColor = "#999";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "#ddd";
            }}
            title="More actions"
          >
            ⋯
          </button>

          {/* Dropdown menu */}
          {showDeleteMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "150px",
                zIndex: 1000,
                marginTop: 4,
              }}
            >
              <div
                onClick={handleDeleteContact}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#dc3545",
                  fontWeight: 500,
                  transition: "background-color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                }}
              >
                <span style={{ fontSize: "16px" }}>🗑️</span>
                Delete Contact
              </div>
            </div>
          )}
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
