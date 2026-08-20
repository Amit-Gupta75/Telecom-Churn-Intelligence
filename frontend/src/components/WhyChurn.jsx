import { Lightbulb } from "lucide-react";

// Translates a raw model factor (name + direction) into the plain-language
// phrase a retention rep would actually say out loud.
const PHRASES = {
  "Contract type": "No long-term contract commitment",
  "Tech support": "No tech support subscription",
  "Payment method": "Using electronic check (higher churn segment)",
  "Tenure": "Still early in their tenure",
  "Monthly charges": "Above-average monthly bill",
  "Total charges": "Low lifetime spend relative to tenure",
  "Internet service": "On fiber without protection add-ons",
  "Online security": "No online security add-on",
  "Online backup": "No online backup add-on",
  "Device protection": "No device protection add-on",
  "Streaming TV": "Not using entertainment add-ons",
  "Streaming movies": "Not using entertainment add-ons",
  "Paperless billing": "Paperless billing (higher churn pattern)",
  "Has partner": "Single customer (no household ties)",
  "Has dependents": "No dependents on the account",
  "Multiple lines": "Running multiple lines",
  "Senior citizen": "Senior citizen segment",
  "Gender": "Demographic segment"
};

function phraseFor(factor) {
  const base = PHRASES[factor.name] || factor.name;
  return base;
}

export default function WhyChurn({ factors = [], summary }) {
  const riskFactors = factors.filter((f) => f.direction === "up");
  const shown = (riskFactors.length ? riskFactors : factors).slice(0, 5);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Lightbulb size={16} color="var(--signal-mid)" />
        <h4 style={{ fontSize: 15 }}>Why they might churn</h4>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 14 }}>Top contributing factors, in plain language</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {shown.map((f, i) => (
          <span
            key={i}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(228,83,107,0.1)",
              color: "#B72E48"
            }}
          >
            {phraseFor(f)}
          </span>
        ))}
      </div>

      {summary && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--ink)",
            background: "var(--surface-sunken)",
            padding: 12,
            borderRadius: 10,
            margin: 0
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}
