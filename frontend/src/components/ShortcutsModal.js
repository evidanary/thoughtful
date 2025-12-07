import React from 'react';

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
  maxWidth: 700,
  width: "90%",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
  position: "relative",
};

const sectionStyle = {
  marginBottom: 32,
};

const titleStyle = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 20,
  color: "#333",
};

const sectionTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
  color: "#4B0082",
  borderBottom: "2px solid #4B0082",
  paddingBottom: 8,
};

const shortcutRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #f0f0f0",
};

const descriptionStyle = {
  fontSize: 14,
  color: "#333",
};

const keyStyle = {
  background: "#f5f5f5",
  border: "1px solid #ddd",
  borderRadius: 4,
  padding: "4px 10px",
  fontSize: 13,
  fontFamily: "monospace",
  color: "#555",
  boxShadow: "0 2px 0 rgba(0,0,0,0.1)",
  minWidth: 60,
  textAlign: "center",
};

const calloutStyle = {
  background: "#f8f9fa",
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  padding: 12,
  marginBottom: 12,
};

const calloutHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
};

const calloutKeywordStyle = {
  fontWeight: 600,
  fontSize: 15,
  color: "#4B0082",
  fontFamily: "monospace",
};

const calloutDescStyle = {
  fontSize: 13,
  color: "#555",
  lineHeight: 1.5,
};

const exampleStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 4,
  padding: 8,
  marginTop: 6,
  fontSize: 12,
  fontFamily: "monospace",
  color: "#666",
};

const ShortcutsModal = ({ onClose }) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

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

        <h1 style={titleStyle}>⌨️ Keyboard Shortcuts & Special Keywords</h1>

        {/* Keyboard Shortcuts Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Keyboard Shortcuts</h2>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Show this help</span>
            <span style={keyStyle}>{modKey} + /</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Search contacts</span>
            <span style={keyStyle}>{modKey} + K</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Navigate to contacts list</span>
            <span style={keyStyle}>G → H</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Navigate to action items</span>
            <span style={keyStyle}>G → A</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Navigate to milestones</span>
            <span style={keyStyle}>G → M</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Navigate to email templates</span>
            <span style={keyStyle}>G → E</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Navigate to social media</span>
            <span style={keyStyle}>G → S</span>
          </div>

          <div style={shortcutRowStyle}>
            <span style={descriptionStyle}>Close modal / Cancel</span>
            <span style={keyStyle}>Esc</span>
          </div>
        </div>

        {/* Special Keywords Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Special Keywords in Notes</h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            Use these special keywords in your contact notes to create trackable
            action items:
          </p>

          <div style={calloutStyle}>
            <div style={calloutHeaderStyle}>
              <span style={{ fontSize: 18 }}>📋</span>
              <span style={calloutKeywordStyle}>@action</span>
            </div>
            <div style={calloutDescStyle}>
              Creates an action item that you need to do. These items appear in
              the Action Items page with a "DO" label and can be tracked until
              completion.
            </div>
            <div style={exampleStyle}>
              Example: @action Follow up with John about the proposal by Friday
            </div>
          </div>

          <div style={calloutStyle}>
            <div style={calloutHeaderStyle}>
              <span style={{ fontSize: 18 }}>❓</span>
              <span style={calloutKeywordStyle}>@ask</span>
            </div>
            <div style={calloutDescStyle}>
              Creates an ask item - a question or request you need to follow up
              on. These appear in the Action Items page with an "ASK" label.
            </div>
            <div style={exampleStyle}>
              Example: @ask Does Sarah have availability for a meeting next
              week?
            </div>
          </div>

          <div style={calloutStyle}>
            <div style={calloutHeaderStyle}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={calloutKeywordStyle}>[DONE]</span>
            </div>
            <div style={calloutDescStyle}>
              Marks an action item or ask as completed. Add this to the end of
              any line containing @action or @ask to mark it as done. Done items
              appear with a strikethrough.
            </div>
            <div style={exampleStyle}>
              Example: @action Send meeting notes to team [DONE]
            </div>
          </div>

          <div
            style={{
              background: "#f0f7ff",
              border: "1px solid #b3d9ff",
              borderRadius: 6,
              padding: 12,
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#0066cc",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              💡 Pro Tip
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
              You can have multiple action items in a single note. Each line
              containing @action or @ask will be tracked separately in the
              Action Items page, grouped by contact and sorted by most recent
              interaction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;


