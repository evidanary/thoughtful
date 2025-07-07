import { useState } from "react";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const boxStyle = {
  background: "#fff",
  borderRadius: 10,
  padding: 32,
  minWidth: 400,
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  position: "relative",
};

const SaveViewModal = ({ onClose, onSave, currentFilters }) => {
  const [form, setForm] = useState({
    label: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.label.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...form,
        filter_json: JSON.stringify(currentFilters),
      });
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save view");
      setLoading(false);
    }
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: 24 }}>Save Current View</h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
            >
              Name:
            </label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Enter view name..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{ display: "block", marginBottom: 4, fontWeight: 600 }}
            >
              Description:
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter view description..."
              rows={3}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4,
                fontSize: 14,
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: 4,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: 4,
                background: "#4B0082",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving..." : "Save View"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveViewModal;
