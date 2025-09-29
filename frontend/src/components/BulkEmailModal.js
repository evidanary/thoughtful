import { useState, useEffect } from "react";
import { getAllEmailTemplates } from "../api/emailTemplates";
import { getContact } from "../api/contacts";

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
  minWidth: 900,
  maxWidth: 1200,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  position: "relative",
};

const BulkEmailModal = ({ onClose }) => {
  const [contactIds, setContactIds] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactEmails, setContactEmails] = useState({}); // Store email data per contact
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load email templates when modal opens
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const templatesData = await getAllEmailTemplates();
        setTemplates(templatesData);
        
        // Auto-select the first template (most recently updated)
        if (templatesData.length > 0) {
          const firstTemplate = templatesData[0];
          setSelectedTemplate(firstTemplate);
        }
        setError("");
      } catch (err) {
        console.error("Error loading templates:", err);
        setError("Failed to load email templates");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setSelectedTemplate(template);
      // Apply template to all contacts that don't have custom email data yet
      const newContactEmails = { ...contactEmails };
      contacts.forEach(contact => {
        if (!newContactEmails[contact.id]) {
          newContactEmails[contact.id] = {
            subject: template.subject,
            body: template.body
          };
        }
      });
      setContactEmails(newContactEmails);
    }
  };

  // Get email data for current contact
  const getCurrentEmailData = () => {
    if (!selectedContact) return { subject: "", body: "" };
    return contactEmails[selectedContact.id] || { subject: "", body: "" };
  };

  // Update email data for current contact
  const updateCurrentEmailData = (field, value) => {
    if (!selectedContact) return;
    setContactEmails(prev => ({
      ...prev,
      [selectedContact.id]: {
        ...prev[selectedContact.id],
        [field]: value
      }
    }));
  };

  // Load contacts when contact IDs change
  useEffect(() => {
    const loadContacts = async () => {
      if (!contactIds.trim()) {
        setContacts([]);
        setSelectedContact(null);
        return;
      }

      try {
        setLoadingContacts(true);
        const ids = contactIds.split(',').map(id => id.trim()).filter(id => id && !isNaN(id));
        
        if (ids.length === 0) {
          setContacts([]);
          setSelectedContact(null);
          return;
        }

        const contactPromises = ids.map(id => getContact(parseInt(id)));
        const contactResults = await Promise.allSettled(contactPromises);
        
        const validContacts = contactResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        setContacts(validContacts);
        
        // Initialize email data for new contacts with selected template
        if (selectedTemplate && validContacts.length > 0) {
          const newContactEmails = { ...contactEmails };
          validContacts.forEach(contact => {
            if (!newContactEmails[contact.id]) {
              newContactEmails[contact.id] = {
                subject: selectedTemplate.subject,
                body: selectedTemplate.body
              };
            }
          });
          setContactEmails(newContactEmails);
        }
        
        // Auto-select the first contact
        if (validContacts.length > 0 && !selectedContact) {
          setSelectedContact(validContacts[0]);
        }
      } catch (err) {
        console.error("Error loading contacts:", err);
        setError("Failed to load some contacts");
      } finally {
        setLoadingContacts(false);
      }
    };

    // Debounce the contact loading
    const timeoutId = setTimeout(loadContacts, 500);
    return () => clearTimeout(timeoutId);
  }, [contactIds, selectedContact]);

  // Handle Send Email
  const handleSendEmail = () => {
    if (!selectedContact || !selectedContact.email) {
      alert("Please select a contact with a valid email address.");
      return;
    }

    const currentEmailData = getCurrentEmailData();
    if (!currentEmailData.subject.trim() || !currentEmailData.body.trim()) {
      alert("Please fill in both email subject and body.");
      return;
    }

    // Replace template variables with actual contact data
    const processedSubject = currentEmailData.subject
      .replace(/\[FIRSTNAME\]/g, selectedContact.name?.split(' ')[0] || selectedContact.name || '')
      .replace(/\[COMPANY\]/g, selectedContact.company || '')
      .replace(/\[TOPIC\]/g, '')
      .replace(/\[SENDER\]/g, '');

    const processedBody = currentEmailData.body
      .replace(/\[FIRSTNAME\]/g, selectedContact.name?.split(' ')[0] || selectedContact.name || '')
      .replace(/\[COMPANY\]/g, selectedContact.company || '')
      .replace(/\[TOPIC\]/g, '')
      .replace(/\[SENDER\]/g, '');

    // Create mailto URL
    const mailtoUrl = `mailto:${encodeURIComponent(selectedContact.email)}?subject=${encodeURIComponent(processedSubject)}&body=${encodeURIComponent(processedBody)}`;

    // Open default email client
    window.location.href = mailtoUrl;

    // TODO: Add activity tracking when backend endpoint is available
    // For now, we'll just log it
    console.log(`Email generated for contact ${selectedContact.name} (${selectedContact.email})`);
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
          Bulk Email
        </h2>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '12px 20px',
            borderRadius: '8px',
            border: '1px solid #f5c6cb',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Contact IDs Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: "block", 
            fontWeight: 600, 
            marginBottom: 8,
            fontSize: 14,
            color: "#333"
          }}>
            Contact IDs (comma separated)
          </label>
          <textarea
            value={contactIds}
            onChange={(e) => setContactIds(e.target.value)}
            placeholder="1,2,3,4,5..."
            rows={3}
            autoComplete="off"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: 14,
              fontFamily: "monospace",
              resize: "vertical",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Email Template Dropdown */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: "block", 
            fontWeight: 600, 
            marginBottom: 8,
            fontSize: 14,
            color: "#333"
          }}>
            Email Template
          </label>
          {loading ? (
            <div style={{
              padding: 12,
              textAlign: "center",
              color: "#666",
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              border: "1px solid #ddd"
            }}>
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div style={{
              padding: 12,
              textAlign: "center",
              color: "#666",
              backgroundColor: "#f8f9fa",
              borderRadius: 8,
              border: "1px solid #ddd"
            }}>
              No email templates found. Create some templates first.
            </div>
          ) : (
            <select
              value={selectedTemplate?.id || ""}
              onChange={(e) => handleTemplateChange(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                backgroundColor: "white",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        </div>


        {/* Contact Carousel */}
        {contactIds.trim() && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: "block", 
              fontWeight: 600, 
              marginBottom: 8,
              fontSize: 14,
              color: "#333"
            }}>
              Select Contact ({contacts.length} loaded)
            </label>
            
            {loadingContacts ? (
              <div style={{
                padding: 20,
                textAlign: "center",
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #ddd"
              }}>
                Loading contacts...
              </div>
            ) : contacts.length === 0 ? (
              <div style={{
                padding: 20,
                textAlign: "center",
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                border: "1px solid #ddd"
              }}>
                No valid contacts found. Check your contact IDs.
              </div>
            ) : (
              <div style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                padding: "8px 0",
                maxHeight: "120px"
              }}>
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    style={{
                      minWidth: "200px",
                      padding: 12,
                      borderRadius: 8,
                      border: selectedContact?.id === contact.id 
                        ? "2px solid #4B0082" 
                        : "1px solid #ddd",
                      backgroundColor: selectedContact?.id === contact.id 
                        ? "#f8f4ff" 
                        : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: selectedContact?.id === contact.id 
                        ? "0 2px 8px rgba(75, 0, 130, 0.2)" 
                        : "0 1px 3px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedContact?.id !== contact.id) {
                        e.target.style.borderColor = "#999";
                        e.target.style.backgroundColor = "#f8f9fa";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedContact?.id !== contact.id) {
                        e.target.style.borderColor = "#ddd";
                        e.target.style.backgroundColor = "white";
                      }
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#333",
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {contact.name}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "#666",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      📧 {contact.email || "No email"}
                    </div>
                    {contact.company && (
                      <div style={{
                        fontSize: 11,
                        color: "#888",
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        🏢 {contact.company}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Left/Right Panes Layout */}
        {selectedContact && (
          <div style={{
            display: "flex",
            gap: 24,
            marginBottom: 24
          }}>
            {/* Left Pane - Email Customization */}
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: 16,
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #4B0082",
                paddingBottom: 8
              }}>
                📧 Email Customization
              </h3>

              {/* Email Subject */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: "block", 
                  fontWeight: 600, 
                  marginBottom: 6,
                  fontSize: 13,
                  color: "#333"
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={getCurrentEmailData().subject}
                  onChange={(e) => updateCurrentEmailData('subject', e.target.value)}
                  placeholder="Email subject..."
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 13,
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Email Body */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ 
                  display: "block", 
                  fontWeight: 600, 
                  marginBottom: 6,
                  fontSize: 13,
                  color: "#333"
                }}>
                  Email Body
                </label>
                <div style={{
                  fontSize: 11,
                  color: "#666",
                  marginBottom: 6,
                  fontStyle: "italic"
                }}>
                  Use [FIRSTNAME], [COMPANY], [TOPIC], [SENDER] for dynamic content
                </div>
                <textarea
                  value={getCurrentEmailData().body}
                  onChange={(e) => updateCurrentEmailData('body', e.target.value)}
                  placeholder="Email body content..."
                  rows={12}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    fontSize: 13,
                    fontFamily: "monospace",
                    lineHeight: "1.4",
                    resize: "vertical",
                    minHeight: "250px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Right Pane - Contact Info and Notes */}
            <div style={{ flex: 1 }}>
              {/* Contact Info Summary */}
              <div style={{
                marginBottom: 16,
                padding: 12,
                backgroundColor: "#f0f8ff",
                border: "1px solid #b3d9ff",
                borderRadius: 6,
                fontSize: 12
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Contact Info:</div>
                <div>📧 {selectedContact.email || "No email"}</div>
                {selectedContact.company && <div>🏢 {selectedContact.company}</div>}
                {selectedContact.linkedin && (
                  <div>
                    💼 <a href={selectedContact.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5" }}>
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              <h3 style={{
                margin: "0 0 16px 0",
                fontSize: 16,
                fontWeight: 600,
                color: "#333",
                borderBottom: "2px solid #00BFFF",
                paddingBottom: 8
              }}>
                📝 Notes for {selectedContact.name}
              </h3>

              <div style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                minHeight: "250px",
                maxHeight: "300px",
                overflowY: "auto"
              }}>
                {selectedContact.notes && selectedContact.notes.length > 0 ? (
                  <div>
                    {selectedContact.notes.map((note, index) => (
                      <div key={note.id || index} style={{
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: index < selectedContact.notes.length - 1 ? "1px solid #e0e0e0" : "none"
                      }}>
                        <div style={{
                          fontSize: 11,
                          color: "#888",
                          marginBottom: 6,
                          fontWeight: 500
                        }}>
                          {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: "#333",
                          lineHeight: "1.4",
                          whiteSpace: "pre-wrap"
                        }}>
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: "center",
                    color: "#666",
                    fontStyle: "italic",
                    paddingTop: 40
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
                    <p style={{ margin: 0 }}>No notes available for this contact</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: 12, 
          justifyContent: "flex-end",
          marginTop: 24
        }}>
          <button
            onClick={onClose}
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
            Close
          </button>
          
          {selectedContact && selectedContact.email && getCurrentEmailData().subject.trim() && getCurrentEmailData().body.trim() && (
            <button
              onClick={handleSendEmail}
              style={{
                background: "linear-gradient(135deg, #4B0082, #00BFFF)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(75, 0, 130, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: 16 }}>📧</span>
              Send Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkEmailModal;
