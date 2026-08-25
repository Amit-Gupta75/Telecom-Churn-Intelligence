import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, Brain, MessagesSquare, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/employee", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/employee/customers", label: "Customers", icon: Users },
  { to: "/employee/predictions", label: "Predictions", icon: Brain },
  { to: "/employee/interactions", label: "Interactions", icon: MessagesSquare }
];

export default function EmployeeLayout() {
  const { logout } = useAuth();
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
            <div style={{ fontSize: 10.5, opacity: 0.6, fontFamily: "var(--font-mono)" }}>EMPLOYEE DESK</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
