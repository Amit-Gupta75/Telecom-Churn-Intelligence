import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { LayoutGrid, Users, Cpu } from "lucide-react";
import { getStats } from "../services/api.js";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/customers", label: "Customers", icon: Users }
];

function timeAgo(iso) {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Navbar({open,setOpen}) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = () => getStats().then(setStats).catch(() => setStats(null));
    load();
    // Real-time-ish refresh so the model status widget stays current
    // without the user having to reload the page.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const model = stats?.model?.trained ? stats.model : null;

  return (
    <>
    <aside
    className={`sidebar ${open ? "" : "closed"}`}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
        <span className="signal-bars" style={{ color: "var(--risk-low)" }}>
          <i></i><i></i><i></i><i></i>
        </span>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Signal</div>
          <div style={{ fontSize: 10.5, opacity: 0.6, fontFamily: "var(--font-mono)" }}>CHURN &amp; RETENTION</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: isActive ? "var(--signal-deep)" : "rgba(255,255,255,0.82)",
              background: isActive ? "#fff" : "transparent"
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, opacity: 0.6, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <Cpu size={12} />
          Model status
        </div>
        {model ? (
          <div style={{ fontSize: 11.5, opacity: 0.85, lineHeight: 1.6 }}>
            <div>Churn model v{model.version} · refreshed {timeAgo(model.trainedAt)}</div>
            <div>AUC {model.auc} · {model.trainingRows?.toLocaleString()} rows trained</div>
            <div>{stats?.predictionCount ?? 0} predictions run · {stats?.customerCount ?? 0} customers</div>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, opacity: 0.6 }}>Model not trained yet</div>
        )}
      </div>
      
    </aside>

    <button
      className="sidebar-arrow"
      onClick={()=>setOpen(!open)}
      >

      {
      open
      ?
      "‹"
      :
      "›"
      }

      </button>
        </>
  );
}
