import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

import { getMyProfile } from "../../services/api";
import Loading from "../../components/Loading.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function Recharge() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then(setCustomer)
      .catch((err) => setError(err.response?.data?.message || "Unable to load your account."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading recharge…" />;
  if (error) return <p style={{ color: "var(--risk-high)", fontSize: 13.5 }}>{error}</p>;

  return (
    <div>
      <div className="eyebrow">Recharge</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Recharge your account</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Top up your plan and keep your service running.
      </p>

      <div className="card" style={{ padding: 20, marginTop: 22, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Current plan</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.internetService || "—"} · {customer.contract}</div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Plan cost</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>${Number(customer.monthlyCharges || 0).toFixed(2)}/mo</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <EmptyState
          icon={Zap}
          title="Recharge service unavailable"
          message="Online recharge isn't connected yet — there's no wallet balance or recharge plan catalog on your account, so we can't process a top-up here. Please check with support for how to recharge outside the app for now."
          note="Backend work required: a balance/wallet field on the customer record, a RechargePlan catalog, and a POST /api/recharges endpoint to process and log transactions. Recharge history would come from that same transaction log — none exists yet, so it isn't shown."
        />
      </div>
    </div>
  );
}
