import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Zap,
  Layers,
  Activity,
  Receipt,
  Gift,
  User,
  Settings as SettingsIcon,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/customer", label: "Home", icon: Home, end: true },
  { to: "/customer/recharge", label: "Recharge", icon: Zap },
  { to: "/customer/plan", label: "My Plan", icon: Layers },
  { to: "/customer/usage", label: "Usage", icon: Activity },
  { to: "/customer/bills", label: "Bills & Payments", icon: Receipt },
  { to: "/customer/offers", label: "Offers", icon: Gift },
  { to: "/customer/profile", label: "Profile", icon: User },
  { to: "/customer/settings", label: "Settings", icon: SettingsIcon },
  { to: "/customer/support", label: "Help & Support", icon: HelpCircle }
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px" }}>
          <span className="signal-bars" style={{ color: "var(--risk-low)" }}>
            <i></i><i></i><i></i><i></i>
          </span>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Signal</div>
            <div style={{ fontSize: 10.5, opacity: 0.6, fontFamily: "var(--font-mono)" }}>MY ACCOUNT</div>
          </div>
        </div>

        {user?.name && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.06)"
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--signal-live)",
                color: "var(--signal-deep)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Customer</div>
            </div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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

        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.82)",
            background: "rgba(255,255,255,0.06)",
            border: "none"
          }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}
