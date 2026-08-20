function riskBadge(prob) {
  if (prob == null) return null;
  const pct = Math.round(prob * 100);
  const key = prob >= 0.66 ? "high" : prob >= 0.33 ? "medium" : "low";
  const label = key === "high" ? "HIGH" : key === "medium" ? "MEDIUM" : "LOW";
  return (
    <div style={{ textAlign: "right" }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>Churn risk score</div>
      <span className={`badge badge-${key}`} style={{ fontSize: 13, padding: "6px 14px" }}>
        {pct}% {label}
      </span>
    </div>
  );
}

export default function CustomerHeaderCard({ customer, probability }) {
  if (!customer) return null;

  const segment = Number(customer.monthlyCharges) >= 80 ? "Business segment" : "Value segment";

  return (
    <div className="card" style={{ padding: 22, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
      <div>
        <span className="badge" style={{ background: "rgba(27,110,127,0.1)", color: "var(--signal-mid)", marginBottom: 8 }}>
          {segment}
        </span>
        <h1 style={{ fontSize: 24, marginTop: 8, marginBottom: 14 }}>{customer.name}</h1>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>Plan</div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{customer.internetService || "—"}</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>Tenure</div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{customer.tenure ?? 0} months</div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>Contract</div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{customer.contract || "—"}</div>
          </div>
          {customer.location && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 3 }}>Location</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{customer.location}</div>
            </div>
          )}
        </div>
      </div>

      {riskBadge(probability ?? customer.churnProbability)}
    </div>
  );
}
