import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Receipt, Layers, Activity, Gift, MapPin, Phone, Calendar } from "lucide-react";

import { getMyProfile, getInteractions } from "../../services/api";
import Loading from "../../components/Loading.jsx";

const quickActions = [
  { to: "/customer/recharge", label: "Recharge", icon: Zap, tint: "#1FB6A6" },
  { to: "/customer/bills", label: "Pay Bill", icon: Receipt, tint: "#1B6E7F" },
  { to: "/customer/plan", label: "My Plan", icon: Layers, tint: "#F2A445" },
  { to: "/customer/usage", label: "Usage", icon: Activity, tint: "#103B4C" }
];

export default function CustomerDashboard() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const me = await getMyProfile();
      setCustomer(me);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "We couldn't find a profile linked to your account yet. Please contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading label="Loading your account…" />;
  if (error) return <p style={{ color: "var(--risk-high)", fontSize: 13.5 }}>{error}</p>;

  return (
    <div>
      <div className="eyebrow">My account</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Welcome, {customer.name}</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Here&apos;s what&apos;s happening with your service.
      </p>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 14,
          marginTop: 22
        }}
      >
        {quickActions.map(({ to, label, icon: Icon, tint }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card"
            style={{
              padding: "18px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
              border: "1px solid var(--border)",
              textAlign: "left"
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                background: tint + "1f",
                color: tint
              }}
            >
              <Icon size={18} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--signal-deep)" }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Current plan + account summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginTop: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Current plan</span>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
            <h2 style={{ fontSize: 22 }}>{customer.internetService || "—"}</h2>
            <span className="badge" style={{ background: "rgba(27,110,127,0.1)", color: "var(--signal-mid)" }}>
              {customer.contract}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 16,
              marginTop: 20
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Monthly charges</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--signal-deep)" }}>
                ${Number(customer.monthlyCharges || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Payment method</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.paymentMethod || "—"}</div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Tenure</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.tenure ?? 0} months</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Account summary</span>

          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Phone size={15} color="var(--ink-faint)" />
              <span style={{ fontSize: 13.5 }}>{customer.phone || "No phone on file"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MapPin size={15} color="var(--ink-faint)" />
              <span style={{ fontSize: 13.5 }}>{customer.location || "No location on file"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Calendar size={15} color="var(--ink-faint)" />
              <span style={{ fontSize: 13.5 }}>{customer.tenure ?? 0} month{customer.tenure === 1 ? "" : "s"} with us</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="card" style={{ padding: 22, marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Gift size={16} color="var(--signal-mid)" />
          <span className="eyebrow">Offers for you</span>
        </div>

        <p style={{ fontSize: 13.5, color: "var(--ink-muted)", marginTop: 12 }}>
          No offers available right now.
        </p>
      </div>
    </div>
  );
}
