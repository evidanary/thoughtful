import { useEffect, useState } from "react";
import { getAllContacts } from "../api/contacts";
import ContactProfilePreview from "./ContactProfilePreview";

const TABS = [
  { label: "All", filter: null },
  { label: "Investors", filter: { tags: ["investor"] } },
  { label: "Partners", filter: { tags: ["partner"] } },
  // Add more tabs as needed
];

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
  const [selectedTab, setSelectedTab] = useState(0);

  const fetchContacts = async (filter) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQueryParams(filter);
      const data = await getAllContacts(query);
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts(TABS[selectedTab].filter);
    // eslint-disable-next-line
  }, [selectedTab]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 0" }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setSelectedTab(idx)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "none",
              background: idx === selectedTab ? "#4B0082" : "#eee",
              color: idx === selectedTab ? "#fff" : "#333",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
              marginBottom: 4,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Contact List */}
      {loading ? (
        <div style={{ padding: 32 }}>Loading...</div>
      ) : error ? (
        <div style={{ color: "red", padding: 32 }}>{error}</div>
      ) : contacts.length === 0 ? (
        <div>No contacts found.</div>
      ) : (
        contacts.map((contact) => (
          <ContactProfilePreview key={contact.id} contact={contact} />
        ))
      )}
    </div>
  );
};

export default ContactList;
