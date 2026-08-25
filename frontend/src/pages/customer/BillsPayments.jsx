import { useEffect, useState } from "react";
import { Receipt, History } from "lucide-react";

import { getMyProfile } from "../../services/api";
import Loading from "../../components/Loading.jsx";
import EmptyState from "../../components/EmptyState.jsx";

export default function BillsPayments() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then(setCustomer)
      .catch((err) => setError(err.response?.data?.message || "Unable to load billing information."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading bills…" />;
  if (error) return <p style={{ color: "var(--risk-high)", fontSize: 13.5 }}>{error}</p>;

  return (
    <div>
      <div className="eyebrow">Bills & payments</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Billing</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Your current charges and payment method on file.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Receipt size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Current cycle</h4>
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 4 }}>Monthly charges</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--signal-deep)" }}>
            ${Number(customer.monthlyCharges || 0).toFixed(2)}
          </div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 4 }}>Payment method</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.paymentMethod || "—"}</div>

          <div className="eyebrow" style={{ marginTop: 16, marginBottom: 4 }}>Paperless billing</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.paperlessBilling || "—"}</div>

          <button className="btn btn-primary" style={{ marginTop: 20, opacity: 0.5, cursor: "not-allowed" }} disabled>
            Pay bill
          </button>
          <p style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8 }}>
            Online payment isn&apos;t connected to a payment gateway yet.
          </p>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Total billed to date</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--signal-deep)" }}>
            ${Number(customer.totalCharges || 0).toFixed(2)}
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 10 }}>
            Lifetime charges recorded on your account.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <EmptyState
          icon={History}
          title="No payment history available"
          message="We don't have individual invoices or past payment records on file, so a transaction-level history and invoice downloads aren't available yet."
          note="Backend work required: an Invoice/Payment model tracking each billing cycle and transaction, plus a GET /api/customers/me/payments endpoint to list and download them."
        />
      </div>
    </div>
  );
}
