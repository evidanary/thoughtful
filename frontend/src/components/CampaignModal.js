import { useState } from "react";
import { createCampaign, updateCampaign } from "../api/campaigns";

const STATUSES = ["active", "paused", "completed"];

/**
 * Create or edit a campaign. New campaigns get the default stage template
 * assigned server-side, so this form only covers the campaign's own metadata.
 */
const CampaignModal = ({ campaign, onClose, onSaved }) => {
  const isEdit = Boolean(campaign);
  const [form, setForm] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    goal: campaign?.goal || "",
    status: campaign?.status || "active",
    start_date: campaign?.start_date || new Date().toISOString().slice(0, 10),
    end_date: campaign?.end_date || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Give the campaign a name");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = isEdit
        ? await updateCampaign(campaign.id, form)
        : await createCampaign(form);
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to save campaign");
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
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          width: 520,
          maxWidth: "92vw",
          maxHeight: "88vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ margin: "0 0 18px", color: "#4B0082", fontSize: 20 }}>
          {isEdit ? "Edit campaign" : "New campaign"}
        </h2>

        <label style={labelStyle}>Name</label>
        <input
          type="text"
          value={form.name}
          onChange={set("name")}
          autoFocus
          placeholder="e.g. High Alpha Cinematic Universe — Mumbai"
          style={inputStyle}
        />

        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={3}
          placeholder="What is this campaign trying to do?"
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <label style={labelStyle}>Goal</label>
        <input
          type="text"
          value={form.goal}
          onChange={set("goal")}
          placeholder="e.g. 5 signed partnership deals"
          style={inputStyle}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Start date</label>
            <input
              type="date"
              value={form.start_date || ""}
              onChange={set("start_date")}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>End date</label>
            <input
              type="date"
              value={form.end_date || ""}
              onChange={set("end_date")}
              style={inputStyle}
            />
          </div>
        </div>

        <label style={labelStyle}>Status</label>
        <select value={form.status} onChange={set("status")} style={inputStyle}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {!isEdit && (
          <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>
            The default stage template is assigned automatically — you can add
            or remove stages once the campaign exists.
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
            type="button"
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
            type="submit"
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
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create campaign"}
          </button>
        </div>
      </form>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#555",
  margin: "12px 0 4px",
};

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default CampaignModal;
