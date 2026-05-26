import { useState, useEffect } from "react";
import { getTagDefinitions, createTagDefinition, updateTagDefinition, deleteTagDefinition } from "../api/tags";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", description: "" });
  const [newTag, setNewTag] = useState({ name: "", description: "" });
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    try {
      const data = await getTagDefinitions();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async () => {
    if (!newTag.name.trim()) return;
    setError("");
    try {
      await createTagDefinition(newTag.name.trim(), newTag.description.trim());
      setNewTag({ name: "", description: "" });
      setShowNewForm(false);
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create tag");
    }
  };

  const handleEditSave = async (id) => {
    if (!editData.name.trim()) return;
    setError("");
    try {
      await updateTagDefinition(id, editData.name.trim(), editData.description.trim());
      setEditingId(null);
      fetchTags();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update tag");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete tag "${name}"? It will be removed from the tag library but existing contact associations remain.`)) return;
    try {
      await deleteTagDefinition(id);
      fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>Tags</h2>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>
            {tags.length} tag{tags.length !== 1 ? "s" : ""} — add descriptions to give tags context
          </p>
        </div>
        <button
          onClick={() => { setShowNewForm(true); setError(""); }}
          style={{
            background: "#4B0082",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "9px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + New Tag
        </button>
      </div>

      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#c00", fontSize: 13 }}>
          {error}
        </div>
      )}

      {showNewForm && (
        <div style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 10,
          padding: "18px 20px",
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: "#1a1a1a" }}>New Tag</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: "0 0 180px" }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Name</label>
              <input
                autoFocus
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag((p) => ({ ...p, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. investor"
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Description</label>
              <input
                type="text"
                value={newTag.description}
                onChange={(e) => setNewTag((p) => ({ ...p, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="What does this tag mean?"
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCreate}
              disabled={!newTag.name.trim()}
              style={{
                padding: "7px 18px", borderRadius: 6, border: "none",
                background: newTag.name.trim() ? "#4B0082" : "#c4a8d8",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: newTag.name.trim() ? "pointer" : "default",
              }}
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewForm(false); setNewTag({ name: "", description: "" }); }}
              style={{ padding: "7px 14px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", fontSize: 13, cursor: "pointer", color: "#555" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#aaa", fontSize: 14 }}>Loading...</div>
      ) : tags.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px", color: "#aaa",
          border: "2px dashed #e8e8e8", borderRadius: 12, fontSize: 14,
        }}>
          No tags yet. Create one above or add tags on a contact profile.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 10,
                padding: "14px 18px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {editingId === tag.id ? (
                <div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: "0 0 180px" }}>
                      <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Name</label>
                      <input
                        autoFocus
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleEditSave(tag.id)}
                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 3 }}>Description</label>
                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleEditSave(tag.id)}
                        style={{ width: "100%", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEditSave(tag.id)}
                      style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: "#4B0082", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer", color: "#555" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          background: "#f3ecff",
                          color: "#4B0082",
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {tag.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#bbb" }}>
                        {tag.usage_count} contact{tag.usage_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {tag.description ? (
                      <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{tag.description}</div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#ccc", marginTop: 6, fontStyle: "italic" }}>No description</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditingId(tag.id); setEditData({ name: tag.name, description: tag.description || "" }); setError(""); }}
                      style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer", color: "#555" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #eee", background: "#fff", fontSize: 12, cursor: "pointer", color: "#bbb" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
