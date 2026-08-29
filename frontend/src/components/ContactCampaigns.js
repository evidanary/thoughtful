import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getContactCampaigns,
  getAllCampaigns,
  addContactsToCampaign,
  updateCampaignContact,
  removeContactFromCampaign,
} from "../api/campaigns";

/**
 * The campaigns a contact is enrolled in, and where they sit in each one.
 * Stages differ per campaign, so the dropdown is rebuilt from that campaign's
 * own stage list.
 */
const ContactCampaigns = ({ contactId }) => {
  const [memberships, setMemberships] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [adding, setAdding] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [mine, all] = await Promise.all([
        getContactCampaigns(contactId),
        getAllCampaigns(),
      ]);
      setMemberships(mine);
      setAllCampaigns(all);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const stagesFor = (campaignId) => {
    const campaign = allCampaigns.find((c) => c.id === campaignId);
    return campaign ? campaign.stages : [];
  };

  const handleStageChange = async (campaignId, stageId) => {
    await updateCampaignContact(campaignId, contactId, { stage_id: stageId });
    load();
  };

  const handleAdd = async (campaignId) => {
    if (!campaignId) return;
    await addContactsToCampaign(campaignId, [contactId]);
    setAdding("");
    load();
  };

  const handleRemove = async (campaignId) => {
    await removeContactFromCampaign(campaignId, contactId);
    load();
  };

  const joinable = allCampaigns.filter(
    (c) => !memberships.some((m) => m.campaign_id === c.id)
  );

  if (loading) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ margin: "0 0 8px" }}>Campaigns</h4>

      {memberships.length === 0 && (
        <p style={{ fontSize: 12, color: "#999", margin: "0 0 8px" }}>
          Not in any campaign yet.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {memberships.map((m) => {
          const stages = stagesFor(m.campaign_id);
          return (
            <div
              key={m.campaign_id}
              style={{
                border: "1px solid #eee",
                borderLeft: `4px solid ${m.stage_color || "#bbb"}`,
                borderRadius: 6,
                padding: "8px 10px",
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Link
                  to={`/campaigns/${m.campaign_id}`}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#4B0082",
                    textDecoration: "none",
                  }}
                >
                  {m.campaign_name}
                </Link>
                <button
                  onClick={() => handleRemove(m.campaign_id)}
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                <select
                  value={m.stage_id || ""}
                  onChange={(e) =>
                    handleStageChange(m.campaign_id, parseInt(e.target.value, 10))
                  }
                  style={{
                    flex: 1,
                    padding: "5px 8px",
                    border: "1px solid #ddd",
                    borderRadius: 5,
                    fontSize: 12,
                    background: "#fff",
                  }}
                >
                  {!m.stage_id && <option value="">Unassigned</option>}
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {m.stage_position !== null && m.stage_count > 0 && (
                  <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>
                    {m.stage_position + 1}/{m.stage_count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {joinable.length > 0 && (
        <select
          value={adding}
          onChange={(e) => handleAdd(parseInt(e.target.value, 10))}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "7px 10px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 12,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="">+ Add to campaign…</option>
          {joinable.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ContactCampaigns;
