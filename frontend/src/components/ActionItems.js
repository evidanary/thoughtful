import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllActionItems } from '../api/actionItems';
import { updateNote } from "../api/contacts";

const ActionItems = () => {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActionItems = async () => {
    try {
      setLoading(true);
      console.log("Fetching action items...");
      const items = await getAllActionItems();
      console.log("Raw action items from API:", items);
      console.log("Number of items received:", items.length);

      // Group by contact and sort by most recent note date
      const groupedItems = groupActionItemsByContact(items);
      console.log("Grouped action items:", groupedItems);
      setActionItems(groupedItems);
    } catch (err) {
      console.error("Error fetching action items:", err);
      setError("Failed to load action items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActionItems();
  }, []);

  // Refresh data when component becomes visible (when user navigates to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchActionItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh when window gets focus (user comes back to tab)
    window.addEventListener('focus', fetchActionItems);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchActionItems);
    };
  }, []);

  const groupActionItemsByContact = (items) => {
    const grouped = {};

    items.forEach((item) => {
      const contactKey = item.contact_id;
      if (!grouped[contactKey]) {
        grouped[contactKey] = {
          contact: {
            id: item.contact_id,
            name: item.contact_name,
            email: item.contact_email,
            company: item.contact_company,
          },
          actionItems: [],
          mostRecentNoteDate: item.note_updated_at,
        };
      }

      grouped[contactKey].actionItems.push({
        noteId: item.note_id,
        content: item.content,
        createdAt: item.note_created_at,
        updatedAt: item.note_updated_at,
      });

      // Update most recent note date if this note is more recent
      if (item.note_updated_at > grouped[contactKey].mostRecentNoteDate) {
        grouped[contactKey].mostRecentNoteDate = item.note_updated_at;
      }
    });

    // Convert to array and sort by most recent interaction (note date)
    return Object.values(grouped).sort(
      (a, b) => new Date(b.mostRecentNoteDate) - new Date(a.mostRecentNoteDate)
    );
  };

  const extractActionItems = (content) => {
    // Split content by lines and find lines containing @action or @ask
    const lines = content.split("\n");
    const actionLines = lines.filter(
      (line) =>
        line.toLowerCase().includes("@action") ||
        line.toLowerCase().includes("@ask")
    );

    return actionLines
      .map((line) => {
        // Determine the type of action item
        const isAction = line.toLowerCase().includes("@action");
        const isAsk = line.toLowerCase().includes("@ask");
        const type = isAction ? "action" : "ask";

        // Check if the action is marked as done
        const isDone = line.toLowerCase().includes("[done]");

        // Remove @action/@ask, [DONE], and clean up the text
        let cleanText = line
          .replace(/@action/gi, "")
          .replace(/@ask/gi, "")
          .replace(/\[done\]/gi, "")
          .replace(/["""]/g, "")
          .trim();

        return {
          text: cleanText,
          type: type,
          isDone: isDone,
          originalLine: line,
        };
      })
      .filter((item) => item.text.length > 0);
  };

  const handleMarkAsDone = async (
    contactId,
    noteId,
    originalContent,
    actionLine
  ) => {
    try {
      // Add [DONE] to the specific action line
      const updatedContent = originalContent.replace(
        actionLine,
        actionLine + " [DONE]"
      );

      await updateNote(contactId, noteId, updatedContent);

      // Refresh the action items
      await fetchActionItems();
    } catch (error) {
      console.error("Error marking action as done:", error);
      // You could add a toast notification here
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#666" }}>
          Loading action items...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#c00" }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333",
              margin: "0 0 4px 0",
            }}
          >
            Action Items
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: 0,
            }}
          >
            All @action and @ask items from contacts' notes, grouped by contact
            and sorted by most recent interaction.
          </p>
        </div>
        <button
          onClick={fetchActionItems}
          disabled={loading}
          style={{
            backgroundColor: "#4B0082",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {loading ? "🔄" : "↻"} {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {actionItems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
          <h3 style={{ fontSize: "20px", color: "#666", margin: "0 0 8px 0" }}>
            No Action Items Found
          </h3>
          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            Add "@action" or "@ask" to your contact notes to see them here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {actionItems.map(
            ({ contact, actionItems: items, mostRecentNoteDate }) => (
              <div
                key={contact.id}
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {/* Contact Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <Link
                        to={`/profile/${contact.id}`}
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#4B0082",
                          textDecoration: "none",
                        }}
                      >
                        {contact.name}
                      </Link>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {contact.email && <span>📧 {contact.email}</span>}
                        {contact.company && <span>🏢 {contact.company}</span>}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#888",
                      textAlign: "right",
                    }}
                  >
                    {formatDate(mostRecentNoteDate)}
                  </div>
                </div>

                {/* Action Items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {items.map((item, index) => {
                    const actions = extractActionItems(item.content);
                    return actions.map((action, actionIndex) => (
                      <div
                        key={`${item.noteId}-${actionIndex}`}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          padding: "8px 10px",
                          backgroundColor: action.isDone
                            ? "#f0f8f0"
                            : "#f8f9fa",
                          borderRadius: "4px",
                          borderLeft: `3px solid ${
                            action.isDone ? "#28a745" : "#ffc107"
                          }`,
                          opacity: action.isDone ? 0.8 : 1,
                        }}
                      >
                        {/* Type Pill */}
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            backgroundColor:
                              action.type === "action" ? "#4B0082" : "#0066cc",
                            color: "white",
                            textTransform: "uppercase",
                            minWidth: "40px",
                            textAlign: "center",
                            marginTop: "2px",
                            flexShrink: 0,
                          }}
                        >
                          {action.type === "action" ? "DO" : "ASK"}
                        </div>

                        {/* Status Icon */}
                        <div
                          style={{
                            fontSize: "14px",
                            marginTop: "1px",
                            minWidth: "20px",
                            cursor: action.isDone ? "default" : "pointer",
                            userSelect: "none",
                            flexShrink: 0,
                          }}
                          onClick={() => {
                            if (!action.isDone) {
                              handleMarkAsDone(
                                contact.id,
                                item.noteId,
                                item.content,
                                action.originalLine
                              );
                            }
                          }}
                          title={
                            action.isDone ? "Done" : "Click to mark as done"
                          }
                        >
                          {action.isDone ? (
                            <span style={{ color: "#28a745" }}>✅</span>
                          ) : (
                            <span style={{ color: "#ffc107" }}>⏳</span>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              color: action.isDone ? "#666" : "#333",
                              lineHeight: "1.3",
                              marginBottom: "2px",
                              textDecoration: action.isDone
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {action.text}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                            }}
                          >
                            From note • {formatDate(item.updatedAt)} •{" "}
                            {action.isDone ? "Done" : "Pending"}
                          </div>
                        </div>
                      </div>
                    ));
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ActionItems;
