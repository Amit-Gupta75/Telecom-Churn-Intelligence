import { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp, RefreshCw, ArrowUpRight, ChevronRight
} from "lucide-react";

const COLORS = { low: "#1FB6A6", medium: "#F2A445", high: "#E4536B" };

function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}
const FIELDS = {
  contract: (c) => pick(c, ["contract", "Contract"]),
  tenure: (c) => pick(c, ["tenure", "Tenure"]),
  techSupport: (c) => pick(c, ["techSupport", "TechSupport", "tech_support"]),
  monthlyCharges: (c) => pick(c, ["monthlyCharges", "MonthlyCharges", "monthly_charges"]),
  internetService: (c) => pick(c, ["internetService", "InternetService"])
};

function StatCard({ icon: Icon, label, value, tint, subtext }) {
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="eyebrow">{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: tint + "22", color: tint }}>
          <Icon size={15} />
        </span>
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--signal-deep)" }}>
        {value}
      </span>
      {subtext && (
        <span style={{ fontSize: 12, color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          {subtext}
        </span>
      )}
    </div>
  );
}

function RiskBadge({ level }) {
  const tint = level === "HIGH" ? COLORS.high : level === "MEDIUM" ? COLORS.medium : COLORS.low;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: tint,
      background: tint + "1a", padding: "3px 9px", borderRadius: 999
    }}>
      {level}
    </span>
  );
}

function EmptyNote({ children }) {
  return <p style={{ fontSize: 12.5, color: "var(--ink-muted)", padding: "10px 0" }}>{children}</p>;
}

export default function Dashboard({
  customers = [],
  trendHistory = [],
  previousPeriodCount,
  onRefresh,
  onViewAll,
  onViewCustomer
}) {
  const [refreshing, setRefreshing] = useState(false);

  const total = customers.length;
  const scored = customers.filter((c) => c.churnProbability != null);
  const high = scored.filter((c) => c.churnProbability >= 0.66);
  const medium = scored.filter((c) => c.churnProbability >= 0.33 && c.churnProbability < 0.66);
  const low = scored.filter((c) => c.churnProbability < 0.33);
  const avgRisk = scored.length
    ? Math.round((scored.reduce((s, c) => s + c.churnProbability, 0) / scored.length) * 100)
    : null;
  const highPct = total ? Math.round((high.length / total) * 100) : 0;
  const medPct  = total ? Math.round((medium.length / total) * 100) : 0;

  const growthPct = (previousPeriodCount && previousPeriodCount > 0)
    ? +(((total - previousPeriodCount) / previousPeriodCount) * 100).toFixed(1)
    : null;

  const pieData = [
    { name: "Low",    value: low.length,    color: COLORS.low    },
    { name: "Medium", value: medium.length, color: COLORS.medium },
    { name: "High",   value: high.length,   color: COLORS.high   }
  ];

  const topHighRisk = [...scored]
    .sort((a, b) => b.churnProbability - a.churnProbability)
    .slice(0, 5);

  function driverRate(getter, matchFn, label) {
    const group = scored.filter((c) => matchFn(getter(c)));
    if (group.length === 0) return null;
    const groupHigh = group.filter((c) => c.churnProbability >= 0.66).length;
    return { label, value: Math.round((groupHigh / group.length) * 100), n: group.length };
  }
  const avgCharges = scored.length
    ? scored.reduce((s, c) => s + (Number(FIELDS.monthlyCharges(c)) || 0), 0) / scored.length
    : 0;

  const churnDrivers = [
    driverRate(FIELDS.contract,        (v) => v === "Month-to-month",  "Month-to-month contract"),
    driverRate(FIELDS.techSupport,     (v) => v === "No",              "No tech support"),
    driverRate(FIELDS.tenure,          (v) => Number(v) < 12,          "Tenure under 12 months"),
    driverRate(FIELDS.monthlyCharges,  (v) => Number(v) > avgCharges,  "Above-average charges"),
    driverRate(FIELDS.internetService, (v) => v === "Fiber optic",     "Fiber optic internet")
  ].filter(Boolean).sort((a, b) => b.value - a.value).slice(0, 4);

  const retentionActions = [
    { label: "Offer discount",   count: high.filter((c) => FIELDS.contract(c) === "Month-to-month").length },
    { label: "Premium support",  count: high.filter((c) => FIELDS.techSupport(c) === "No").length },
    { label: "Plan upgrade",     count: medium.length }
  ].filter((a) => a.count > 0);

  const maxDriver = Math.max(...churnDrivers.map((d) => d.value), 1);

  function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    Promise.resolve(onRefresh?.()).finally(() => setTimeout(() => setRefreshing(false), 600));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--signal-deep)", margin: 0 }}>
            Telecom Churn Intelligence
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "4px 0 0" }}>
            Customer retention &amp; risk overview
          </p>
        </div>
        <button onClick={handleRefresh} style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
          color: "var(--signal-deep)", background: "var(--surface-sunken)", border: "none",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer"
        }}>
          <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
          Refresh
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
        <StatCard icon={Users} label="Customers" value={total.toLocaleString()} tint="#1B6E7F"
          subtext={growthPct != null ? (
            <><ArrowUpRight size={12} color={growthPct >= 0 ? COLORS.low : COLORS.high} /> {growthPct}%</>
          ) : null}
        />
        <StatCard icon={AlertTriangle} label="High risk"   value={high.length}   tint={COLORS.high}   subtext={total ? `${highPct}% of base` : null} />
        <StatCard icon={ShieldCheck}   label="Medium risk" value={medium.length}  tint={COLORS.medium} subtext={total ? `${medPct}% of base` : null} />
        <StatCard icon={TrendingUp}    label="Avg. risk"   value={avgRisk != null ? `${avgRisk}%` : "—"} tint="#1B6E7F" />
      </div>

      {/* Risk distribution + trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Risk distribution</span>
          {total > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {pieData.map((d) => {
                  const pct = total ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--signal-deep)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: d.color }} />
                      {d.name}
                      <span style={{ marginLeft: "auto", fontWeight: 700 }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={42} outerRadius={65} paddingAngle={3}>
                      {pieData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <EmptyNote>No scored customers yet. Run predictions to populate this chart.</EmptyNote>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Churn risk trend</span>
          {trendHistory.length > 0 ? (
            <div style={{ height: 150, marginTop: 14 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgRisk" stroke={COLORS.medium} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyNote>Trend data builds up as you run predictions over time — check back after a few sessions.</EmptyNote>
          )}
        </div>
      </div>

      {/* Drivers + actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="eyebrow">Top churn drivers</span>
          {churnDrivers.length > 0 ? churnDrivers.map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "var(--signal-deep)", width: 170, flexShrink: 0 }}>{d.label}</span>
              <div style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--surface-sunken)", overflow: "hidden" }}>
                <div style={{ width: `${(d.value / maxDriver) * 100}%`, height: "100%", borderRadius: 999, background: COLORS.high }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-muted)", width: 28, textAlign: "right" }}>{d.value}%</span>
            </div>
          )) : (
            <EmptyNote>Run predictions on a few customers to see which factors drive churn most.</EmptyNote>
          )}
        </div>

        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="eyebrow" style={{ marginBottom: 8 }}>Retention actions</span>
          {retentionActions.length > 0 ? retentionActions.map((a, i) => (
            <div key={a.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)"
            }}>
              <span style={{ fontSize: 13, color: "var(--signal-deep)" }}>{a.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-muted)" }}>{a.count} customers</span>
            </div>
          )) : (
            <EmptyNote>No at-risk customers currently need action.</EmptyNote>
          )}
        </div>
      </div>

      {/* High-risk customers table */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="eyebrow">High-risk customers</span>
          <button onClick={onViewAll} style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600,
            color: "var(--signal-deep)", background: "none", border: "none", cursor: "pointer"
          }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {topHighRisk.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--ink-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}>Customer</th>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}>Probability</th>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}>Risk</th>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}>Monthly charges</th>
                <th style={{ padding: "6px 8px", fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {topHighRisk.map((c) => {
                const charges = FIELDS.monthlyCharges(c);
                const level = c.churnProbability >= 0.66 ? "HIGH" : c.churnProbability >= 0.33 ? "MEDIUM" : "LOW";
                return (
                  <tr key={c._id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: "var(--signal-deep)" }}>{c.name}</td>
                    <td style={{ padding: "10px 8px" }}>{Math.round(c.churnProbability * 100)}%</td>
                    <td style={{ padding: "10px 8px" }}><RiskBadge level={level} /></td>
                    <td style={{ padding: "10px 8px" }}>{charges != null ? `$${Number(charges).toFixed(2)}` : "—"}</td>
                    <td style={{ padding: "10px 8px", textAlign: "right" }}>
                      <button
                        onClick={() => onViewCustomer?.(c._id)}
                        style={{
                          fontSize: 12, fontWeight: 600, color: "var(--signal-deep)",
                          background: "var(--surface-sunken)", border: "none", borderRadius: 8,
                          padding: "5px 10px", cursor: "pointer"
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyNote>Run predictions on customers to see high-risk ones here.</EmptyNote>
        )}
      </div>

    </div>
  );
}