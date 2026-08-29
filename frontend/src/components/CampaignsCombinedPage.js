import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCombinedCampaigns, getAllCampaigns } from "../api/campaigns";

/**
 * Several campaigns side by side. Because every campaign has its own stage
 * list, the roll-up is a matrix — one row per person, one column per campaign,
 * each cell showing which stage they sit in there.
 */
const CampaignsCombinedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ campaigns: [], rows: [] });
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const ids = useMemo(
    () =>
      String(searchParams.get("ids") || "")
        .split(",")
        .map((n) => parseInt(n, 10))
        .filter((n) => !Number.isNaN(n)),
    [searchParams]
  );

  useEffect(() => {
    getAllCampaigns().then(setAllCampaigns).catch(console.error);
  }, []);

  useEffect(() => {
    if (!ids.length) {
      setData({ campaigns: [], rows: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    getCombinedCampaigns(ids)
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load the combined view");
        setLoading(false);
      });
  }, [ids]);

  const toggleCampaign = (id) => {
    const next = ids.includes(id) ? ids.filter((n) => n !== id) : [...ids, id];
    setSearchParams(next.length ? { ids: next.join(",") } : {});
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter((row) =>
      [row.contact.name, row.contact.company, row.contact.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [data.rows, query]);

  return (
    <div style={{ padding: "28px 32px" }}>
      <Link
        to="/campaigns"
        style={{ fontSize: 13, color: "#4B0082", textDecoration: "none" }}
      >
        ← All campaigns
      </Link>

      <h1 style={{ margin: "10px 0 6px", fontSize: 24, color: "#4B0082" }}>
        Combined campaign view
      </h1>
      <p style={{ margin: "0 0 18px", color: "#666", fontSize: 14 }}>
        Where everybody stands across {data.campaigns.length} campaign
        {data.campaigns.length === 1 ? "" : "s"}.
      </p>

      {/* Campaign picker — toggling rebuilds the matrix */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {allCampaigns.map((campaign) => {
          const on = ids.includes(campaign.id);
          return (
            <button
              key={campaign.id}
              onClick={() => toggleCampaign(campaign.id)}
              style={{
                border: on ? "1px solid #4B0082" : "1px solid #ddd",
                background: on ? "#4B0082" : "#fff",
                color: on ? "#fff" : "#555",
                borderRadius: 16,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {campaign.name}
            </button>
          );
        })}
      </div>

      {loading && <p style={{ color: "#666" }}>Loading…</p>}
      {error && <p style={{ color: "#c00" }}>{error}</p>}

      {!loading && !ids.length && (
        <p style={{ color: "#777" }}>
          Pick at least one campaign above to build the view.
        </p>
      )}

      {!loading && ids.length > 0 && (
        <>
          {/* Per-campaign stage totals */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {data.campaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: 12,
                  background: "#fff",
                  minWidth: 240,
                }}
              >
                <Link
                  to={`/campaigns/${campaign.id}`}
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#4B0082",
                    textDecoration: "none",
                  }}
                >
                  {campaign.name}
                </Link>
                <div style={{ fontSize: 11, color: "#888", margin: "2px 0 8px" }}>
                  {campaign.contact_count} contacts · {campaign.status}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {campaign.stages.map((stage) => (
                    <span
                      key={stage.id}
                      style={{
                        fontSize: 11,
                        border: "1px solid #eee",
                        borderLeft: `3px solid ${stage.color}`,
                        borderRadius: 4,
                        padding: "2px 7px",
                        color: "#555",
                      }}
                    >
                      {stage.name}{" "}
                      <b style={{ color: stage.contact_count ? "#4B0082" : "#bbb" }}>
                        {stage.contact_count}
                      </b>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter people…"
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
              width: 260,
              marginBottom: 12,
              outline: "none",
            }}
          />

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                background: "#fff",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#f7f7f9" }}>
                    Person
                  </th>
                  {data.campaigns.map((campaign) => (
                    <th key={campaign.id} style={thStyle}>
                      {campaign.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.contact.id}>
                    <td style={{ ...tdStyle, position: "sticky", left: 0, background: "#fff" }}>
                      <Link
                        to={`/profile/${row.contact.id}`}
                        style={{ color: "#4B0082", textDecoration: "none", fontWeight: 600 }}
                      >
                        {row.contact.name}
                      </Link>
                      {row.contact.company && (
                        <div style={{ fontSize: 11, color: "#888" }}>
                          {row.contact.company}
                        </div>
                      )}
                    </td>
                    {data.campaigns.map((campaign) => {
                      const entry = row.entries[campaign.id];
                      return (
                        <td key={campaign.id} style={tdStyle}>
                          {entry ? (
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#fff",
                                background: entry.stage_color || "#bbb",
                                borderRadius: 10,
                                padding: "3px 10px",
                              }}
                            >
                              {entry.stage_name || "Unassigned"}
                            </span>
                          ) : (
                            <span style={{ color: "#ccc" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={data.campaigns.length + 1}
                      style={{ ...tdStyle, color: "#888" }}
                    >
                      Nobody to show.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "2px solid #e0e0e0",
  fontSize: 12,
  color: "#555",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #f0f0f0",
  verticalAlign: "top",
};

export default CampaignsCombinedPage;
