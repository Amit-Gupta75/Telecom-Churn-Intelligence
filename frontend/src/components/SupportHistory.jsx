import { useState } from "react";
import { PhoneCall, Plus } from "lucide-react";

const TYPE_LABEL = {
  complaint: "Complaint",
  technician_visit: "Technician visit",
  installation: "Installation",
  billing: "Billing",
  other: "Other"
};

const SEVERITY_COLOR = {
  high: "var(--risk-high)",
  medium: "var(--risk-medium)",
  low: "var(--risk-low)"
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

export default function SupportHistory({ interactions = [], onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("complaint");
  const [severity, setSeverity] = useState("medium");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd({ title, type, severity, notes });
      setTitle("");
      setNotes("");
      setType("complaint");
      setSeverity("medium");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PhoneCall size={16} color="var(--signal-mid)" />
          <h4 style={{ fontSize: 15 }}>Support &amp; complaint history</h4>
        </div>
        <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} />
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 14 }}>Most recent interactions</p>

      {showForm && (
        <form onSubmit={submit} className="card" style={{ padding: 14, marginBottom: 14, background: "var(--surface-sunken)", border: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="What happened? e.g. Speed complaint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13.5 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13.5 }}>
                {Object.entries(TYPE_LABEL).map(([v, label]) => (
                  <option key={v} value={v}>{label}</option>
                ))}
              </select>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ flex: 1, padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13.5 }}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              style={{ padding: "9px 11px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", resize: "vertical" }}
            />
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: "center" }}>
              {saving ? "Saving…" : "Log interaction"}
            </button>
          </div>
        </form>
      )}

      {interactions.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No interactions logged yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {interactions.map((item) => (
            <div key={item._id} style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: SEVERITY_COLOR[item.severity] || "var(--ink-faint)"
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                  {formatDate(item.occurredAt)} · {TYPE_LABEL[item.type] || item.type}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{item.title}</div>
                {item.notes && (
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 2 }}>{item.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
