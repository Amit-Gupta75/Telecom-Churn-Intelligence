import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const homeByRole = {
  admin: "/admin",
  employee: "/employee",
  customer: "/customer"
};

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)"
      }}
    >
      <div className="card" style={{ width: 380, padding: 34, textAlign: "center" }}>
        <ShieldAlert size={40} color="var(--risk-high)" />

        <h2 style={{ marginTop: 16 }}>Access denied</h2>

        <p style={{ color: "var(--ink-muted)", marginTop: 10, fontSize: 13.5 }}>
          You don&apos;t have permission to view that page.
        </p>

        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 22 }}
          onClick={() => navigate(user ? homeByRole[user.role] || "/login" : "/login")}
        >
          Back to safety
        </button>
      </div>
    </div>
  );
}
