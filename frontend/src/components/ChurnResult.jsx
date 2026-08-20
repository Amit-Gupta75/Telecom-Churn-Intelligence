import RiskFactors from "./RiskFactors.jsx";
import RetentionOffer from "./RetentionOffer.jsx";

function riskLevel(prob) {
  if (prob >= 0.66) return { label: "High risk", key: "high" };
  if (prob >= 0.33) return { label: "Medium risk", key: "medium" };
  return { label: "Low risk", key: "low" };
}

export default function ChurnResult({ result }) {
  if (!result) return null;
  const { probability, factors, offers, summary } = result;
  const risk = riskLevel(probability);
  const pct = Math.round(probability * 100);

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
      <div className="card" style={{ padding: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Churn probability</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 700, color: "var(--signal-deep)" }}>
            {pct}%
          </span>
          <span className={`badge badge-${risk.key}`}>{risk.label}</span>
        </div>
        <div style={{ height: 8, borderRadius: 5, background: "var(--surface-sunken)", marginTop: 14, overflow: "hidden" }}>
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `var(--risk-${risk.key})`,
              borderRadius: 5,
              transition: "width 0.4s ease"
            }}
          />
        </div>
        {summary && (
          <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.6 }}>{summary}</p>
        )}

        <h4 style={{ fontSize: 13, marginTop: 22, marginBottom: 12, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Top risk factors
        </h4>
        <RiskFactors factors={factors} />
      </div>

      <RetentionOffer offers={offers} />
    </div>
  );
}
