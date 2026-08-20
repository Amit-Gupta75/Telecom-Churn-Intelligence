import { Receipt } from "lucide-react";

// Simple, standard CLTV heuristic: monthly revenue divided by an estimated
// monthly churn probability (a lower churn probability implies a much
// longer expected relationship, and therefore higher lifetime value).
function estimateCLTV(monthlyCharges, probability) {
  const safeProbability = Math.max(probability, 0.04);
  const expectedMonths = 1 / safeProbability;
  return Math.round(monthlyCharges * Math.min(expectedMonths, 48)); // capped at a 4-year horizon
}

export default function BillingSummary({ monthlyCharges, totalCharges, paymentMethod, probability }) {
  const cltv = probability != null ? estimateCLTV(Number(monthlyCharges) || 0, probability) : null;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Receipt size={16} color="var(--signal-mid)" />
        <h4 style={{ fontSize: 15 }}>Billing summary</h4>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 16 }}>Current cycle</p>

      <div className="eyebrow" style={{ marginBottom: 4 }}>Monthly charges</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--signal-deep)", marginBottom: 4 }}>
        ${Number(monthlyCharges || 0).toFixed(2)}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 16 }}>
        Lifetime billed ${Number(totalCharges || 0).toFixed(2)}
      </div>

      <div className="eyebrow" style={{ marginBottom: 4 }}>Payment method</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>{paymentMethod || "—"}</div>

      {cltv != null && (
        <>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Estimated CLTV</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--signal-deep)" }}>
            ${cltv.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>
            Estimate — projected from current monthly revenue and churn risk
          </div>
        </>
      )}
    </div>
  );
}
