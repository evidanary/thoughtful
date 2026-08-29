import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCampaigns,
  getStageTemplates,
  saveStageTemplates,
} from "../api/campaigns";
import CampaignModal from "./CampaignModal";
import StageEditorModal from "./StageEditorModal";

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

// "Ends in 12 days" / "Ended 3 days ago" — campaigns are time-bound, so this is
// the number that actually matters at a glance.
const timeRemaining = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return null;
  const days = Math.ceil((end - new Date()) / 86400000);
  if (days > 0) return { text: `${days}d left`, color: days <= 14 ? "#FF8C00" : "#666" };
  if (days === 0) return { text: "ends today", color: "#c00" };
  return { text: `ended ${Math.abs(days)}d ago`, color: "#c00" };
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [list, tmpl] = await Promise.all([
        getAllCampaigns(),
        getStageTemplates(),
      ]);
      setCampaigns(list);
      setTemplates(tmpl);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load campaigns");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCombined = () => {
    navigate(`/campaigns/combined?ids=${Array.from(selected).join(",")}`);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, color: "#4B0082" }}>
          🎯 Campaigns
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowTemplateEditor(true)}
            style={secondaryButton}
          >
            Default stages
          </button>
          <button onClick={() => setShowNew(true)} style={primaryButton}>
            + New campaign
          </button>
        </div>
      </div>
      <p style={{ margin: "0 0 20px", color: "#666", fontSize: 14 }}>
        Time-bound pushes with their own stage progression. Newest first.
      </p>

      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "#f3eaff",
            border: "1px solid #d9c6f5",
            borderRadius: 8,
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 13, color: "#4B0082", fontWeight: 600 }}>
            {selected.size} campaign{selected.size === 1 ? "" : "s"} selected
          </span>
          <button onClick={openCombined} style={primaryButton}>
            Combine &amp; compare
          </button>
          <button onClick={() => setSelected(new Set())} style={secondaryButton}>
            Clear
          </button>
        </div>
      )}

      {loading && <p style={{ color: "#666" }}>Loading campaigns…</p>}
      {error && <p style={{ color: "#c00" }}>{error}</p>}

      {!loading && !error && campaigns.length === 0 && (
        <div
          style={{
            border: "1px dashed #ccc",
            borderRadius: 10,
            padding: 40,
            textAlign: "center",
            color: "#777",
          }}
        >
          <p style={{ margin: "0 0 12px" }}>No campaigns yet.</p>
          <button onClick={() => setShowNew(true)} style={primaryButton}>
            Create your first campaign
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {campaigns.map((campaign) => {
          const remaining = timeRemaining(campaign.end_date);
          const isSelected = selected.has(campaign.id);
          return (
            <div
              key={campaign.id}
              style={{
                border: isSelected ? "2px solid #4B0082" : "1px solid #e0e0e0",
                borderRadius: 10,
                background: "#fff",
                padding: 18,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(campaign.id)}
                  title="Select to combine with other campaigns"
                  style={{ marginTop: 5, cursor: "pointer", accentColor: "#4B0082" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                        color: "#4B0082",
                      }}
                    >
                      {campaign.name}
                    </h3>
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
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: 13,
                        color: "#555",
                      }}
                    >
                      {campaign.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 14,
                      marginTop: 8,
                      fontSize: 12,
                      color: "#777",
                    }}
                  >
                    <span>
                      {formatDate(campaign.start_date) || "no start"} →{" "}
                      {formatDate(campaign.end_date) || "open-ended"}
                    </span>
                    {remaining && (
                      <span style={{ color: remaining.color, fontWeight: 600 }}>
                        {remaining.text}
                      </span>
                    )}
                    <span>
                      {campaign.contact_count} contact
                      {campaign.contact_count === 1 ? "" : "s"}
                    </span>
                    {campaign.goal && <span>Goal: {campaign.goal}</span>}
                  </div>

                  {/* Stage breakdown: how many people sit in each stage */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {campaign.stages.map((stage) => (
                      <div
                        key={stage.id}
                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          border: "1px solid #eee",
                          borderLeft: `4px solid ${stage.color}`,
                          borderRadius: 6,
                          padding: "5px 10px",
                          background: "#fafafa",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#444" }}>
                          {stage.name}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: stage.contact_count ? "#4B0082" : "#bbb",
                          }}
                        >
                          {stage.contact_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  style={{ ...secondaryButton, whiteSpace: "nowrap" }}
                >
                  Open board →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showNew && (
        <CampaignModal
          onClose={() => setShowNew(false)}
          onSaved={(created) => navigate(`/campaigns/${created.id}`)}
        />
      )}

      {showTemplateEditor && (
        <StageEditorModal
          title="Default campaign stages"
          subtitle="Every new campaign starts from this list. Existing campaigns keep their own stages."
          stages={templates}
          onSave={async (stages) => {
            const saved = await saveStageTemplates(stages);
            setTemplates(saved);
          }}
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </div>
  );
};

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

export default CampaignsPage;
