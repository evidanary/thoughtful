import { useState } from "react";

const PALETTE = [
  "#00BFFF",
  "#3FA9F5",
  "#7B68EE",
  "#4B0082",
  "#FFB6C1",
  "#FF69B4",
  "#2E8B57",
  "#FF8C00",
  "#888888",
];

/**
 * Defines an ordered list of stages. Used both for a single campaign's
 * progression and for the default template new campaigns start from.
 * Stages that already exist keep their id, so renaming or reordering never
 * loses the contacts sitting in them.
 */
const StageEditorModal = ({
  title,
  subtitle,
  stages: initialStages,
  onSave,
  onClose,
}) => {
  const [stages, setStages] = useState(
    (initialStages || []).map((s) => ({
      id: s.id || null,
      name: s.name,
      color: s.color || "#4B0082",
      contact_count: s.contact_count || 0,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (index, patch) => {
    setStages((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= stages.length) return;
    setStages((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (index) => {
    if (stages.length <= 1) {
      setError("Keep at least one stage");
      return;
    }
    setError(null);
    setStages((prev) => prev.filter((_, i) => i !== index));
  };

  const add = () => {
    setStages((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        color: PALETTE[prev.length % PALETTE.length],
        contact_count: 0,
      },
    ]);
  };

  const handleSave = async () => {
    const cleaned = stages
      .map((s) => ({ ...s, name: s.name.trim() }))
      .filter((s) => s.name);
    if (!cleaned.length) {
      setError("Add at least one named stage");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(cleaned);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to save stages");
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          width: 560,
          maxWidth: "92vw",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ margin: "0 0 4px", color: "#4B0082", fontSize: 20 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666" }}>
            {subtitle}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stages.map((stage, i) => (
            <div
              key={stage.id || `new-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #eee",
                borderRadius: 8,
                padding: "8px 10px",
                background: "#fafafa",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#999",
                  width: 18,
                  textAlign: "right",
                }}
              >
                {i + 1}
              </span>

              <select
                value={stage.color}
                onChange={(e) => update(i, { color: e.target.value })}
                title="Stage color"
                style={{
                  width: 34,
                  height: 30,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  background: stage.color,
                  color: "transparent",
                  cursor: "pointer",
                }}
              >
                {PALETTE.map((c) => (
                  <option key={c} value={c} style={{ color: "#000" }}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={stage.name}
                placeholder="Stage name"
                autoFocus={!stage.name}
                onChange={(e) => update(i, { name: e.target.value })}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  outline: "none",
                }}
              />

              {stage.contact_count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    color: "#666",
                    background: "#eee",
                    borderRadius: 10,
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                  }}
                  title="Contacts currently in this stage"
                >
                  {stage.contact_count}
                </span>
              )}

              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                title="Move up"
                style={arrowStyle(i === 0)}
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === stages.length - 1}
                title="Move down"
                style={arrowStyle(i === stages.length - 1)}
              >
                ↓
              </button>
              <button
                onClick={() => remove(i)}
                title="Remove stage"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#c00",
                  fontSize: 14,
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={add}
          style={{
            marginTop: 12,
            padding: "8px 14px",
            border: "1px dashed #4B0082",
            background: "#fff",
            color: "#4B0082",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add stage
        </button>

        {stages.some((s) => s.id && s.contact_count > 0) && (
          <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
            Removing a stage moves its contacts into the first stage.
          </p>
        )}

        {error && (
          <p style={{ color: "#c00", fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 16px",
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "9px 18px",
              border: "none",
              background: "#4B0082",
              color: "#fff",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : "Save stages"}
          </button>
        </div>
      </div>
    </div>
  );
};

const arrowStyle = (disabled) => ({
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 4,
  width: 26,
  height: 26,
  cursor: disabled ? "default" : "pointer",
  color: disabled ? "#ccc" : "#4B0082",
  fontSize: 12,
  lineHeight: 1,
});

export default StageEditorModal;
