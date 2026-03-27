import { useState } from "react";
import { createQuickNote } from "../api/quickNotes";

export default function QuickAddModal({ onClose, onSaved }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await createQuickNote(content.trim());
      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving quick note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          width: 560,
          maxWidth: "95vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a" }}>Quick Add Note</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
              Paste meeting notes — associate with a contact later
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#999",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "16px 24px" }}>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste or type your meeting notes here..."
            style={{
              width: "100%",
              minHeight: 200,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
              color: "#1a1a1a",
            }}
          />
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
            Tip: ⌘Enter to save
          </div>
        </div>

        <div
          style={{
            padding: "12px 24px 18px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
              color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: "none",
              background: content.trim() && !saving ? "#4B0082" : "#c4a8d8",
              color: "#fff",
              cursor: content.trim() && !saving ? "pointer" : "default",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
