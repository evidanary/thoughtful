import { useState, useEffect } from "react";

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
  borderRadius: 12,
  padding: 32,
  minWidth: 600,
  maxWidth: 800,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  position: "relative",
};

const AddEmailTemplateModal = ({ template, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form if editing existing template
  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        subject: template.subject,
        body: template.body,
      });
    }
  }, [template]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!form.name.trim()) {
      setError("Template name is required");
      return;
    }
    if (!form.subject.trim()) {
      setError("Email subject is required");
      return;
    }
    if (!form.body.trim()) {
      setError("Email body is required");
      return;
    }

    setLoading(true);
    try {
      // If editing, include the ID
      const templateData = template 
        ? { ...form, id: template.id }
        : form;
      
      onSave(templateData);
      setLoading(false);
    } catch (err) {
      setError("Failed to save template");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 24,
            color: "#888",
            cursor: "pointer",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
            e.target.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#888";
          }}
          aria-label="Close"
        >
          ×
        </button>
        
        <h2 style={{ 
          margin: 0, 
          marginBottom: 24, 
          fontSize: 24, 
          fontWeight: 700,
          color: "#333"
        }}>
          {template ? "Edit Email Template" : "Add New Email Template"}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Template Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: "block", 
              fontWeight: 600, 
              marginBottom: 8,
              fontSize: 14,
              color: "#333"
            }}>
              Template Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Welcome Email, Follow-up, Meeting Request"
              autoComplete="off"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 16,
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4B0082";
                e.target.style.outline = "none";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ddd";
              }}
              required
              autoFocus
            />
          </div>

          {/* Email Subject */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: "block", 
              fontWeight: 600, 
              marginBottom: 8,
              fontSize: 14,
              color: "#333"
            }}>
              Email Subject *
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g., Welcome to our platform!"
              autoComplete="off"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 16,
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4B0082";
                e.target.style.outline = "none";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ddd";
              }}
              required
            />
          </div>

          {/* Email Body */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block", 
              fontWeight: 600, 
              marginBottom: 8,
              fontSize: 14,
              color: "#333"
            }}>
              Email Body *
            </label>
            <div style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 8,
              fontStyle: "italic"
            }}>
              Tip: Use [FIRSTNAME], [COMPANY], [TOPIC], [SENDER] for dynamic content
            </div>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Dear [FIRSTNAME],

Thank you for your interest in our platform...

Best regards,
[SENDER]"
              rows={25}
              autoComplete="off"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                fontFamily: "monospace",
                lineHeight: "1.5",
                resize: "vertical",
                minHeight: "400px",
                transition: "border-color 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4B0082";
                e.target.style.outline = "none";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ddd";
              }}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              color: "#dc3545", 
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: 6,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: 12, 
            justifyContent: "flex-end" 
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: "transparent",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f8f9fa";
                e.target.style.borderColor = "#999";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.borderColor = "#ddd";
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              style={{
                background: "#4B0082",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#5a1a9b";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = "#4B0082";
                }
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : (template ? "Update Template" : "Save Template")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmailTemplateModal;
