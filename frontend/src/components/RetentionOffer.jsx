import { Sparkles, CheckCircle2 } from "lucide-react";

const PRIORITY_STYLE = {
  High: { bg: "rgba(228,83,107,0.12)", fg: "#B72E48", accent: "var(--risk-high)" },
  Medium: { bg: "rgba(242,164,69,0.15)", fg: "#A6660F", accent: "var(--risk-medium)" },
  Low: { bg: "rgba(31,182,166,0.12)", fg: "#0E7A6D", accent: "var(--risk-low)" }
};

function OfferCard({ offer }) {
  const style = PRIORITY_STYLE[offer.priority] || PRIORITY_STYLE.Low;

  return (
    <div
      className="card"
      style={{
        padding: 16,
        borderLeft: `3px solid ${style.accent}`,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          className="badge"
          style={{ background: style.bg, color: style.fg, textTransform: "uppercase" }}
        >
          {offer.priority}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--ink-muted)", fontWeight: 600 }}>{offer.category}</span>
      </div>

      <h4 style={{ fontSize: 15, color: "var(--signal-deep)" }}>{offer.title}</h4>

      <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.55, margin: 0 }}>
        {offer.description}
      </p>

      {typeof offer.riskReduction === "number" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <CheckCircle2 size={14} color={style.accent} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: style.accent }}>
            Reduces churn risk by ~{offer.riskReduction}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function RetentionOffer({ offers }) {
  if (!offers || !offers.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={16} color="var(--signal-mid)" />
        <span className="eyebrow">AI retention recommendations</span>
      </div>
      {offers.map((offer, i) => (
        <OfferCard key={i} offer={offer} />
      ))}
    </div>
  );
}
