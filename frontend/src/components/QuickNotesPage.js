import { useState, useEffect, useRef } from "react";
import { getQuickNotes, associateQuickNote, deleteQuickNote } from "../api/quickNotes";
import { getAllContacts } from "../api/contacts";

export default function QuickNotesPage() {
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [associatingId, setAssociatingId] = useState(null);
  const [contactSearch, setContactSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unassociated"); // "unassociated" | "all"
  const dropdownRef = useRef(null);

  const fetchNotes = async () => {
    try {
      const data = await getQuickNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    getAllContacts().then(setContacts).catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAssociatingId(null);
        setContactSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAssociate = async (noteId, contactId) => {
    try {
      await associateQuickNote(noteId, contactId);
      setAssociatingId(null);
      setContactSearch("");
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteQuickNote(noteId);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes =
    filter === "unassociated"
      ? notes.filter((n) => !n.contact_id)
      : notes;

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const unassociatedCount = notes.filter((n) => !n.contact_id).length;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
          Quick Notes Inbox
        </h2>
        <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>
          {unassociatedCount} note{unassociatedCount !== 1 ? "s" : ""} waiting to be associated
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["unassociated", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: filter === f ? "#4B0082" : "#ddd",
              background: filter === f ? "#4B0082" : "#fff",
              color: filter === f ? "#fff" : "#555",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f === "unassociated" ? "Inbox" : "All Notes"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#aaa", fontSize: 14 }}>Loading...</div>
      ) : filteredNotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#aaa",
            border: "2px dashed #e8e8e8",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          {filter === "unassociated"
            ? "No unassociated notes. Use Quick Add to capture meeting notes."
            : "No notes yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 10,
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "inherit",
                    fontSize: 14,
                    color: "#1a1a1a",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    flex: 1,
                  }}
                >
                  {note.content}
                </pre>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {note.contact_id ? (
                    <span
                      style={{
                        fontSize: 12,
                        color: "#4B0082",
                        background: "#f3ecff",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {note.contact_name}
                    </span>
                  ) : (
                    <div style={{ position: "relative" }} ref={associatingId === note.id ? dropdownRef : null}>
                      <button
                        onClick={() => {
                          setAssociatingId(associatingId === note.id ? null : note.id);
                          setContactSearch("");
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "1px solid #4B0082",
                          background: "#fff",
                          color: "#4B0082",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Associate
                      </button>

                      {associatingId === note.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            right: 0,
                            backgroundColor: "#fff",
                            border: "1px solid #e0e0e0",
                            borderRadius: 8,
                            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                            width: 240,
                            zIndex: 100,
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f0f0" }}>
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search contacts..."
                              value={contactSearch}
                              onChange={(e) => setContactSearch(e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                border: "1px solid #e0e0e0",
                                borderRadius: 6,
                                fontSize: 13,
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                          <div style={{ maxHeight: 200, overflowY: "auto" }}>
                            {filteredContacts.length === 0 ? (
                              <div style={{ padding: "12px", color: "#aaa", fontSize: 13, textAlign: "center" }}>
                                No contacts found
                              </div>
                            ) : (
                              filteredContacts.map((c) => (
                                <div
                                  key={c.id}
                                  onClick={() => handleAssociate(note.id, c.id)}
                                  style={{
                                    padding: "9px 14px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    color: "#1a1a1a",
                                    borderBottom: "1px solid #f8f8f8",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0ff")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                                  {c.company && (
                                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{c.company}</div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(note.id)}
                    style={{
                      padding: "5px 8px",
                      borderRadius: 6,
                      border: "1px solid #eee",
                      background: "#fff",
                      color: "#bbb",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 11, color: "#bbb" }}>
                {new Date(note.created_at).toLocaleString()}
                {note.associated_at && (
                  <span style={{ marginLeft: 12, color: "#a88ec0" }}>
                    Associated {new Date(note.associated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
