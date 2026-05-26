import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAll } from "../api/search";

function highlight(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{ background: "#ffe066", borderRadius: 2, padding: "0 1px" }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function Section({ title, count, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "2px solid #f0e8ff",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: "#4B0082" }}>{title}</span>
        <span
          style={{
            background: "#f3ecff",
            color: "#4B0082",
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    searchAll(q)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  const total = results ? results.contacts.length + results.notes.length : 0;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
          Search Results
        </h2>
        {q && !loading && results && (
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>
            {total === 0
              ? `No results for "${q}"`
              : `${total} result${total !== 1 ? "s" : ""} for "${q}"`}
          </p>
        )}
        {!q && (
          <p style={{ margin: "6px 0 0", color: "#aaa", fontSize: 14 }}>
            Type something in the search bar above.
          </p>
        )}
      </div>

      {loading && (
        <div style={{ color: "#aaa", fontSize: 14 }}>Searching...</div>
      )}

      {!loading && results && results.contacts.length === 0 && results.notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "52px 24px",
            color: "#bbb",
            border: "2px dashed #ece8f5",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          No contacts or notes matched <strong style={{ color: "#999" }}>"{q}"</strong>
        </div>
      )}

      {!loading && results && results.contacts.length > 0 && (
        <Section title="Contacts" count={results.contacts.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.contacts.map((c) => (
              <Link
                key={c.id}
                to={`/profile/${c.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e8e8",
                    borderRadius: 10,
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c4a8d8";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(75,0,130,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8e8e8";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #4B0082, #00BFFF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>
                        {highlight(c.name, q)}
                      </div>
                      <div style={{ display: "flex", gap: 16, marginTop: 3, flexWrap: "wrap" }}>
                        {c.email && (
                          <span style={{ fontSize: 12, color: "#888" }}>
                            {highlight(c.email, q)}
                          </span>
                        )}
                        {c.company && (
                          <span style={{ fontSize: 12, color: "#888" }}>
                            {highlight(c.company, q)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {!loading && results && results.notes.length > 0 && (
        <Section title="Notes" count={results.notes.length}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.notes.map((n) => (
              <Link
                key={n.id}
                to={`/profile/${n.contact_id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #e8e8e8",
                    borderRadius: 10,
                    padding: "14px 18px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c4a8d8";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(75,0,130,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8e8e8";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#4B0082",
                        background: "#f3ecff",
                        padding: "2px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {n.contact_name}
                    </span>
                    <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#333",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {highlight(n.content, q)}
                  </div>
                  {n.contact_company && (
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
                      {n.contact_company}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
