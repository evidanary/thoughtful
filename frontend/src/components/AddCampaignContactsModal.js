import { useEffect, useMemo, useState } from "react";
import { getAllContacts } from "../api/contacts";
import { addContactsToCampaign } from "../api/campaigns";

/**
 * Pick contacts to drop into a campaign. Anyone already in the campaign is
 * shown as such rather than hidden, so it is obvious who is covered.
 */
const AddCampaignContactsModal = ({ campaign, onClose, onAdded }) => {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [stageId, setStageId] = useState(
    campaign.stages.length ? campaign.stages[0].id : null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllContacts()
      .then((data) => {
        setContacts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load contacts");
        setLoading(false);
      });
  }, []);

  const existingIds = useMemo(
    () => new Set(campaign.contacts.map((c) => c.id)),
    [campaign.contacts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.company, c.email, (c.tags || []).join(" ")]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [contacts, query]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (!selected.size) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await addContactsToCampaign(
        campaign.id,
        Array.from(selected),
        stageId
      );
      onAdded(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Failed to add contacts");
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
          display: "flex",
          flexDirection: "column",
          padding: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ margin: "0 0 14px", color: "#4B0082", fontSize: 20 }}>
          Add contacts to {campaign.name}
        </h2>

        <input
          type="text"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, email or tag…"
          style={{
            width: "100%",
            padding: "9px 11px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: 8,
            marginTop: 12,
            minHeight: 200,
            maxHeight: 340,
          }}
        >
          {loading && (
            <p style={{ padding: 16, color: "#777", fontSize: 13 }}>Loading…</p>
          )}
          {!loading && filtered.length === 0 && (
            <p style={{ padding: 16, color: "#777", fontSize: 13 }}>
              No contacts match “{query}”.
            </p>
          )}
          {filtered.map((contact) => {
            const already = existingIds.has(contact.id);
            return (
              <label
                key={contact.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderBottom: "1px solid #f2f2f2",
                  cursor: already ? "default" : "pointer",
                  opacity: already ? 0.5 : 1,
                }}
              >
                <input
                  type="checkbox"
                  disabled={already}
                  checked={already || selected.has(contact.id)}
                  onChange={() => toggle(contact.id)}
                  style={{ cursor: already ? "default" : "pointer", accentColor: "#4B0082" }}
                />
                <span style={{ flex: 1, fontSize: 14 }}>
                  {contact.name}
                  {contact.company && (
                    <span style={{ color: "#888", fontSize: 12 }}>
                      {" "}
                      · {contact.company}
                    </span>
                  )}
                </span>
                {already && (
                  <span style={{ fontSize: 11, color: "#888" }}>in campaign</span>
                )}
              </label>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
          }}
        >
          <span style={{ fontSize: 13, color: "#555" }}>Start them in</span>
          <select
            value={stageId || ""}
            onChange={(e) => setStageId(parseInt(e.target.value, 10))}
            style={{
              padding: "7px 10px",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            {campaign.stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p style={{ color: "#c00", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 18,
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
            onClick={handleAdd}
            disabled={saving || !selected.size}
            style={{
              padding: "9px 18px",
              border: "none",
              background: "#4B0082",
              color: "#fff",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving || !selected.size ? "default" : "pointer",
              opacity: saving || !selected.size ? 0.5 : 1,
            }}
          >
            {saving
              ? "Adding…"
              : `Add ${selected.size || ""} contact${
                  selected.size === 1 ? "" : "s"
                }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCampaignContactsModal;
