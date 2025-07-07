import { useEffect, useState } from "react";
import { getAllContacts } from "../api/contacts";
import { getAllViews } from "../api/views";
import ContactProfilePreview from "./ContactProfilePreview";
import FilterBar from "./FilterBar";
import SaveViewModal from "./SaveViewModal";
import { createView } from "../api/views";

function buildQueryParams(filter) {
  if (!filter) return "";
  const params = [];
  if (filter.tags) params.push(`tags=${filter.tags.join(",")}`);
  if (filter.created_after)
    params.push(`created_after=${encodeURIComponent(filter.created_after)}`);
  if (filter.created_before)
    params.push(`created_before=${encodeURIComponent(filter.created_before)}`);
  if (filter.last_activity_after)
    params.push(
      `last_activity_after=${encodeURIComponent(filter.last_activity_after)}`
    );
  if (filter.last_activity_before)
    params.push(
      `last_activity_before=${encodeURIComponent(filter.last_activity_before)}`
    );
  return params.length ? "?" + params.join("&") : "";
}

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [views, setViews] = useState([]);
  const [selectedView, setSelectedView] = useState(0);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  // Fetch views on mount
  useEffect(() => {
    async function fetchViews() {
      try {
        const data = await getAllViews();
        setViews(data);
      } catch (err) {
        console.error("Error fetching views:", err);
        setViews([]);
      }
    }
    fetchViews();
  }, []);

  // Fetch contacts when selectedView or views change
  useEffect(() => {
    async function fetchContacts() {
      setLoading(true);
      setError(null);
      try {
        const viewFilter = views[selectedView]?.filter || {};
        const mergedFilter = { ...viewFilter, ...filters };
        const query = buildQueryParams(mergedFilter);
        const data = await getAllContacts(query);
        setContacts(data);
      } catch (err) {
        setError("Failed to load contacts");
      }
      setLoading(false);
    }
    if (views.length > 0) {
      fetchContacts();
    }
  }, [selectedView, views, filters]);

  const handleSaveView = async (viewData) => {
    const newView = await createView(viewData);
    // Refresh the views list
    const updatedViews = await getAllViews();
    setViews(updatedViews);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 0" }}>
      {/* Views as Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 5,
        }}
      >
        {views.map((view, idx) => (
          <button
            key={view.id}
            onClick={() => setSelectedView(idx)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: idx === selectedView ? "#4B0082" : "#eee",
              color: idx === selectedView ? "#fff" : "#333",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              marginBottom: 4,
            }}
            title={view.description || ""}
          >
            {view.label}
          </button>
        ))}
        <button
          onClick={() => setShowSaveModal(true)}
          style={{
            padding: "8px 12px",
            borderRadius: 20,
            border: "none",
            background: "#333333",
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            marginBottom: 4,
            minWidth: 40,
          }}
          title="Save current filters as a new view"
        >
          +
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Search Bar */}
      <div style={{ marginBottom: 5 }}>
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "450px",
            padding: "12px 10px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            outline: "none",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3498db";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
        />
      </div>

      {showSaveModal && (
        <SaveViewModal
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveView}
          currentFilters={filters}
        />
      )}

      {/* Contact List */}
      {loading ? (
        <div style={{ padding: 32 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "red", padding: 32 }}>{error}</div>
      ) : filteredContacts.length === 0 ? (
        <div>No contacts found.</div>
      ) : (
        filteredContacts.map((contact) => (
          <ContactProfilePreview key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
};

export default ContactList;
