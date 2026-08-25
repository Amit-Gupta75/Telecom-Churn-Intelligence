import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import { Users, UserCog, AlertTriangle, TrendingUp, Eye, Pencil, Trash2 } from "lucide-react";

import { getCustomers, getEmployees, getStats, deleteCustomer } from "../../services/api";
import Loading from "../../components/Loading.jsx";

const COLORS = { low: "#1FB6A6", medium: "#F2A445", high: "#E4536B" };

function riskBadge(prob) {
  if (prob == null) return <span className="badge" style={{ background: "var(--surface-sunken)", color: "var(--ink-muted)" }}>Not scored</span>;
  if (prob >= 0.66) return <span className="badge badge-high">{Math.round(prob * 100)}% High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">{Math.round(prob * 100)}% Medium</span>;
  return <span className="badge badge-low">{Math.round(prob * 100)}% Low</span>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trendHistory, setTrendHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [custs, emps, stats] = await Promise.all([getCustomers(), getEmployees(), getStats()]);
      setCustomers(custs);
      setEmployees(emps);
      setTrendHistory(stats?.trendHistory ?? []);
      setError("");
    } catch (err) {
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <Loading label="Loading dashboard…" />;
  if (error) return <h2>{error}</h2>;

  const scored = customers.filter((c) => c.churnProbability != null);
  const high = scored.filter((c) => c.churnProbability >= 0.66);
  const medium = scored.filter((c) => c.churnProbability >= 0.33 && c.churnProbability < 0.66);
  const low = scored.filter((c) => c.churnProbability < 0.33);
  const avgRisk = scored.length
    ? Math.round((scored.reduce((s, c) => s + c.churnProbability, 0) / scored.length) * 100)
    : null;

  const cards = [
    { title: "Total Customers", value: customers.length, icon: Users, tint: "#1B6E7F" },
    { title: "Total Employees", value: employees.length, icon: UserCog, tint: "#1B6E7F" },
    { title: "High Risk Customers", value: high.length, icon: AlertTriangle, tint: COLORS.high },
    { title: "Average Churn Risk", value: avgRisk != null ? `${avgRisk}%` : "—", icon: TrendingUp, tint: COLORS.medium }
  ];

  const distributionData = [
    { name: "Low", value: low.length, color: COLORS.low },
    { name: "Medium", value: medium.length, color: COLORS.medium },
    { name: "High", value: high.length, color: COLORS.high }
  ];

  const recentCustomers = customers.slice(0, 5);

  return (
    <div>
      <div className="eyebrow">Admin</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Dashboard</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6 }}>Monitor customer churn intelligence.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, marginTop: 25 }}>
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div className="card" key={item.title} style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="eyebrow">{item.title}</span>
                <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: item.tint + "22", color: item.tint }}>
                  <Icon size={16} />
                </span>
              </div>
              <h2 style={{ marginTop: 12, fontSize: 26 }}>{item.value}</h2>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Churn risk trend</span>
          {trendHistory.length > 0 ? (
            <div style={{ height: 200, marginTop: 14 }}>
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
            <p style={{ color: "var(--ink-muted)", fontSize: 13, padding: "14px 0" }}>No trend data yet.</p>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <span className="eyebrow">Customer distribution</span>
          {customers.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {distributionData.map((d) => {
                  const pct = customers.length ? Math.round((d.value / customers.length) * 100) : 0;
                  return (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
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
                    <Pie data={distributionData} dataKey="value" innerRadius={42} outerRadius={65} paddingAngle={3}>
                      {distributionData.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--ink-muted)", fontSize: 13, padding: "14px 0" }}>No customers yet.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20, padding: 22, overflowX: "auto" }}>
        <span className="eyebrow">Recent customers</span>
        <table style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Risk Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentCustomers.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.location || "-"}</td>
                <td>{riskBadge(c.churnProbability)}</td>
                <td>
                  <div className="action-icons">
                    <div className="tooltip">
                      <button className="icon-btn view-icon" onClick={() => navigate(`/admin/customers/${c._id}`)}>
                        <Eye size={17} />
                      </button>
                      <span className="tooltip-text">View</span>
                    </div>
                    <div className="tooltip">
                      <button className="icon-btn edit-icon" onClick={() => navigate(`/admin/customers/${c._id}/edit`)}>
                        <Pencil size={17} />
                      </button>
                      <span className="tooltip-text">Edit</span>
                    </div>
                    <div className="tooltip">
                      <button className="icon-btn delete-icon" onClick={() => remove(c._id)}>
                        <Trash2 size={17} />
                      </button>
                      <span className="tooltip-text">Delete</span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {recentCustomers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--ink-muted)" }}>No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
