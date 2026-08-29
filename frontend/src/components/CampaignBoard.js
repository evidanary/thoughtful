import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCampaign,
  updateCampaignContact,
  removeContactFromCampaign,
  saveCampaignStages,
  deleteCampaign,
} from "../api/campaigns";
import CampaignModal from "./CampaignModal";
import StageEditorModal from "./StageEditorModal";
import AddCampaignContactsModal from "./AddCampaignContactsModal";
import { displayName } from "../api/auth";

const STATUS_COLORS = {
  active: "#2E8B57",
  paused: "#FF8C00",
  completed: "#888888",
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysBetween = (from, to) =>
  Math.round((new Date(to) - new Date(from)) / 86400000);

const CampaignBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [showAddContacts, setShowAddContacts] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCampaign(await getCampaign(id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaign");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreMenu && !event.target.closest("[data-campaign-menu]")) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMoreMenu]);

  const moveContact = async (contactId, stageId) => {
    if (!campaign) return;
    const current = campaign.contacts.find((c) => c.id === contactId);
    if (!current || current.stage_id === stageId) return;

    // Optimistic move so the card lands instantly, then reconcile with the server
    setCampaign((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) =>
        c.id === contactId ? { ...c, stage_id: stageId } : c
      ),
    }));
    try {
      setCampaign(await updateCampaignContact(campaign.id, contactId, {
        stage_id: stageId,
      }));
    } catch (err) {
      console.error(err);
      load();
    }
  };

  // Walk a contact one stage forward or back in this campaign's progression
  const stepContact = (contact, delta) => {
    const index = campaign.stages.findIndex((s) => s.id === contact.stage_id);
    const target = campaign.stages[(index < 0 ? -1 : index) + delta];
    if (target) moveContact(contact.id, target.id);
  };

  const handleRemove = async (contactId) => {
    try {
      setCampaign(await removeContactFromCampaign(campaign.id, contactId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaign(campaign.id);
      navigate("/campaigns");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p style={{ padding: 30, color: "#666" }}>Loading…</p>;
  if (error) return <p style={{ padding: 30, color: "#c00" }}>{error}</p>;
  if (!campaign) return null;

  const unassigned = campaign.contacts.filter((c) => !c.stage_id);
  const daysLeft = campaign.end_date
    ? daysBetween(new Date(), campaign.end_date)
    : null;

  return (
    <div
      style={{
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* --- Campaign header: description and metadata sit above the board --- */}
      <div style={{ flexShrink: 0 }}>
        <Link
          to="/campaigns"
          style={{ fontSize: 13, color: "#4B0082", textDecoration: "none" }}
        >
          ← All campaigns
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            marginTop: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 24, color: "#4B0082" }}>
                {campaign.name}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#fff",
                  background: STATUS_COLORS[campaign.status] || "#888",
                  borderRadius: 10,
                  padding: "2px 8px",
                }}
              >
                {campaign.status}
              </span>
            </div>

            {campaign.description && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#555" }}>
                {campaign.description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 10,
                fontSize: 12,
                color: "#777",
              }}
            >
              <span>
                📅 {formatDate(campaign.start_date) || "no start"} →{" "}
                {formatDate(campaign.end_date) || "open-ended"}
              </span>
              {daysLeft !== null && (
                <span
                  style={{
                    color: daysLeft < 0 ? "#c00" : daysLeft <= 14 ? "#FF8C00" : "#666",
                    fontWeight: 600,
                  }}
                >
                  {daysLeft < 0
                    ? `ended ${Math.abs(daysLeft)}d ago`
                    : `${daysLeft}d left`}
                </span>
              )}
              <span>
                👥 {campaign.contact_count} contact
                {campaign.contact_count === 1 ? "" : "s"}
              </span>
              <span>🪜 {campaign.stages.length} stages</span>
              {campaign.goal && <span>🎯 {campaign.goal}</span>}
              {campaign.created_by && (
                <span>✍️ Created by {displayName(campaign.created_by)}</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowAddContacts(true)} style={primaryButton}>
              + Add contacts
            </button>
            <button onClick={() => setShowStages(true)} style={secondaryButton}>
              Edit stages
            </button>
            <button onClick={() => setShowEdit(true)} style={secondaryButton}>
              Edit
            </button>
            {/* Destructive actions live behind the ⋯ menu */}
            <div style={{ position: "relative" }} data-campaign-menu>
              <button
                onClick={() => setShowMoreMenu((prev) => !prev)}
                title="More actions"
                style={{
                  ...secondaryButton,
                  padding: "8px 12px",
                  fontSize: 16,
                  lineHeight: 1,
                  color: "#666",
                  borderColor: "#ddd",
                }}
              >
                ⋯
              </button>

              {showMoreMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    minWidth: 170,
                    zIndex: 20,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      setConfirmDelete(true);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "none",
                      background: "none",
                      textAlign: "left",
                      fontSize: 13,
                      color: "#c00",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => (e.target.style.background = "#fff5f5")}
                    onMouseOut={(e) => (e.target.style.background = "none")}
                  >
                    Delete campaign
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Kanban: one column per stage --- */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 20,
          overflowX: "auto",
          flex: 1,
          paddingBottom: 12,
          alignItems: "flex-start",
        }}
      >
        {unassigned.length > 0 && (
          <Column
            key="unassigned"
            title="Unassigned"
            color="#bbb"
            contacts={unassigned}
            campaign={campaign}
            onRemove={handleRemove}
            dragging={dragging}
            setDragging={setDragging}
            onStep={stepContact}
          />
        )}

        {campaign.stages.map((stage) => {
          const stageContacts = campaign.contacts.filter(
            (c) => c.stage_id === stage.id
          );
          return (
            <Column
              key={stage.id}
              title={stage.name}
              color={stage.color}
              contacts={stageContacts}
              campaign={campaign}
              onRemove={handleRemove}
              dragging={dragging}
              setDragging={setDragging}
              isDropTarget={dragOverStage === stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverStage(stage.id);
              }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStage(null);
                const contactId = parseInt(
                  e.dataTransfer.getData("text/plain"),
                  10
                );
                if (!Number.isNaN(contactId)) moveContact(contactId, stage.id);
              }}
              onStep={stepContact}
            />
          );
        })}
      </div>

      {showEdit && (
        <CampaignModal
          campaign={campaign}
          onClose={() => setShowEdit(false)}
          onSaved={setCampaign}
        />
      )}

      {showStages && (
        <StageEditorModal
          title={`Stages — ${campaign.name}`}
          subtitle="This campaign's own progression. Renaming and reordering keeps everyone where they are."
          stages={campaign.stages}
          onSave={async (stages) => {
            setCampaign(await saveCampaignStages(campaign.id, stages));
          }}
          onClose={() => setShowStages(false)}
        />
      )}

      {showAddContacts && (
        <AddCampaignContactsModal
          campaign={campaign}
          onClose={() => setShowAddContacts(false)}
          onAdded={setCampaign}
        />
      )}

      {confirmDelete && (
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
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 24,
              width: 420,
              maxWidth: "92vw",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 10px", color: "#c00" }}>
              Delete “{campaign.name}”?
            </h3>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 18px" }}>
              This removes the campaign, its stages, and everyone's position in
              it. The contacts themselves are not touched.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  padding: "9px 16px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                style={{
                  padding: "9px 18px",
                  border: "none",
                  background: "#c00",
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// One kanban column. Cards are draggable; the select is the keyboard-friendly
// way to move someone without dragging.
const Column = ({
  title,
  color,
  contacts,
  campaign,
  onRemove,
  dragging,
  setDragging,
  isDropTarget,
  onDragOver,
  onDragLeave,
  onDrop,
  onStep,
}) => (
  <div
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    style={{
      width: 260,
      flexShrink: 0,
      background: isDropTarget ? "#f3eaff" : "#f7f7f9",
      border: isDropTarget ? "2px dashed #4B0082" : "1px solid #e6e6e6",
      borderTop: `4px solid ${color}`,
      borderRadius: 8,
      padding: 10,
      maxHeight: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>
        {title}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background: color,
          borderRadius: 10,
          minWidth: 20,
          textAlign: "center",
          padding: "1px 7px",
        }}
      >
        {contacts.length}
      </span>
    </div>

    <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
      {contacts.length === 0 && (
        <p style={{ fontSize: 12, color: "#aaa", margin: "8px 4px" }}>
          Drop contacts here
        </p>
      )}
      {contacts.map((contact) => (
        <div
          key={contact.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", String(contact.id));
            setDragging(contact.id);
          }}
          onDragEnd={() => setDragging(null)}
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            padding: "9px 10px",
            cursor: "grab",
            opacity: dragging === contact.id ? 0.4 : 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Link
              to={`/profile/${contact.id}`}
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 600,
                color: "#4B0082",
                textDecoration: "none",
              }}
            >
              {contact.name}
            </Link>
            <button
              onClick={() => onRemove(contact.id)}
              title="Remove from campaign"
              style={{
                background: "none",
                border: "none",
                color: "#bbb",
                cursor: "pointer",
                fontSize: 12,
                padding: 0,
              }}
            >
              ✕
            </button>
          </div>
          {contact.company && (
            <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
              {contact.company}
            </div>
          )}
          {/* Nudge between stages without dragging */}
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            <button
              onClick={() => onStep(contact, -1)}
              disabled={!canStep(campaign, contact, -1)}
              title="Move to previous stage"
              style={stepButton(!canStep(campaign, contact, -1))}
            >
              ◀
            </button>
            <button
              onClick={() => onStep(contact, 1)}
              disabled={!canStep(campaign, contact, 1)}
              title="Move to next stage"
              style={stepButton(!canStep(campaign, contact, 1))}
            >
              ▶
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// A contact can step forward/back only while a neighbouring stage exists
const canStep = (campaign, contact, delta) => {
  const index = campaign.stages.findIndex((s) => s.id === contact.stage_id);
  return Boolean(campaign.stages[(index < 0 ? -1 : index) + delta]);
};

const stepButton = (disabled) => ({
  flex: 1,
  background: "#fff",
  border: "1px solid #e6e6e6",
  borderRadius: 4,
  fontSize: 10,
  color: disabled ? "#ddd" : "#4B0082",
  cursor: disabled ? "default" : "pointer",
  padding: "2px 0",
});

const primaryButton = {
  background: "#4B0082",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButton = {
  background: "#fff",
  color: "#4B0082",
  border: "1px solid #4B0082",
  borderRadius: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default CampaignBoard;
