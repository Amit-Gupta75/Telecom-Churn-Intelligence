import { History, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function riskBadge(prob) {
  if (prob >= 0.66) return <span className="badge badge-high">High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">Medium</span>;
  return <span className="badge badge-low">Low</span>;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function HistoryRow({ entry }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(entry.probability * 100);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          textAlign: "left"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-muted)" }}>
            {formatDate(entry.createdAt)}
          </span>
          <span style={{ fontWeight: 700, color: "var(--signal-deep)" }}>{pct}%</span>
          {riskBadge(entry.probability)}
        </div>
        {open ? <ChevronUp size={16} color="var(--ink-muted)" /> : <ChevronDown size={16} color="var(--ink-muted)" />}
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          {entry.summary && (
            <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55, margin: "12px 0" }}>
              {entry.summary}
            </p>
          )}
          {entry.offers?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {entry.offers.map((o, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--ink)" }}>
                  <strong>{o.priority}</strong> — {o.title}{" "}
                  <span style={{ color: "var(--ink-muted)" }}>(~{o.riskReduction}% reduction)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PredictionHistory({ history = [] }) {
  if (!history.length) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <History size={16} color="var(--signal-mid)" />
        <span className="eyebrow">Past predictions ({history.length})</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map((entry) => (
          <HistoryRow key={entry._id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
