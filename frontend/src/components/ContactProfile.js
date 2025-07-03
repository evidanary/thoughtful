import { useEffect, useState } from "react";
import { getContact, addNote, addTag } from "../api/contacts";
import NoteItem from "./NoteItem";

const ContactProfile = ({ contactId }) => {
  const [contact, setContact] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

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
        <h2>{contact.name}</h2>
        <p>Email: {contact.email}</p>
        <p>LinkedIn: {contact.linkedin}</p>
        <p>Company: {contact.company}</p>

        <h4>Tags</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {contact.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: "#eee",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {tag}
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
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};

export default ContactProfile;
