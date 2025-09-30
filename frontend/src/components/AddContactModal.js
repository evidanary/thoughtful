import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addContact } from "../api/contacts";

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
  minWidth: 340,
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  position: "relative",
};

const AddContactModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    linkedin: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const newContact = await addContact(form);
      setLoading(false);
      onClose();
      // Navigate to the new contact's profile page
      navigate(`/profile/${newContact.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add contact");
      setLoading(false);
    }
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#888",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2
          style={{ margin: 0, marginBottom: 18, fontSize: 22, fontWeight: 700 }}
        >
          Add Contact
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
            >
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 15,
              }}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
            >
              Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 15,
              }}
              type="email"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
            >
              LinkedIn
            </label>
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 15,
              }}
              type="text"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label
              style={{ display: "block", fontWeight: 500, marginBottom: 4 }}
            >
              Company
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 15,
              }}
              type="text"
            />
          </div>
          {error && (
            <div style={{ color: "#c00", marginBottom: 10 }}>{error}</div>
          )}
          <button
            type="submit"
            style={{
              background: "#4B0082",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "10px 20px",
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Contact"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal;
