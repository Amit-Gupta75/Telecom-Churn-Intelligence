import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";

import { getMyProfile } from "../../services/api";
import Loading from "../../components/Loading.jsx";
import ServicesSubscribed from "../../components/ServicesSubscribed.jsx";

function Field({ label, value }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

export default function MyPlan() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then(setCustomer)
      .catch((err) => setError(err.response?.data?.message || "Unable to load your plan."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading your plan…" />;
  if (error) return <p style={{ color: "var(--risk-high)", fontSize: 13.5 }}>{error}</p>;

  return (
    <div>
      <div className="eyebrow">My plan</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Plan & services</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Details of your current contract and subscribed services.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginTop: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Layers size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Plan details</h4>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
              gap: 18,
              marginTop: 18
            }}
          >
            <Field label="Internet service" value={customer.internetService} />
            <Field label="Contract" value={customer.contract} />
            <Field label="Multiple lines" value={customer.multipleLines} />
            <Field label="Paperless billing" value={customer.paperlessBilling} />
            <Field label="Payment method" value={customer.paymentMethod} />
            <Field label="Tenure" value={`${customer.tenure ?? 0} months`} />
          </div>

          <div style={{ display: "flex", gap: 28, marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Monthly charges</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--signal-deep)" }}>
                ${Number(customer.monthlyCharges || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Total charges to date</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--signal-deep)" }}>
                ${Number(customer.totalCharges || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <ServicesSubscribed customer={customer} />
      </div>

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0 }}>
          Want to change or upgrade your plan? Our support team can help.
        </p>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/customer/support")}
        >
          Contact support
        </button>
      </div>
    </div>
  );
}
