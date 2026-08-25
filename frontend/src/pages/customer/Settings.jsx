import { useEffect, useState } from "react";
import { Bell, Lock, Sliders } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { changeMyPassword } from "../../services/api";

const NOTIFICATION_DEFS = [
  { key: "rechargeReminders", label: "Recharge reminders" },
  { key: "billReminders", label: "Bill reminders" },
  { key: "planExpiry", label: "Plan expiry notifications" },
  { key: "promotional", label: "Promotional notifications" }
];

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi"];

function storageKey(userId, suffix) {
  return `customer:${userId}:${suffix}`;
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: checked ? "var(--signal-live)" : "var(--surface-sunken)",
        position: "relative",
        cursor: "pointer",
        transition: ".2s ease",
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          transition: ".2s ease"
        }}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(storageKey(user?.id, "notifications"));
    return saved ? JSON.parse(saved) : { rechargeReminders: true, billReminders: true, planExpiry: true, promotional: false };
  });

  const [language, setLanguage] = useState(
    () => localStorage.getItem(storageKey(user?.id, "language")) || "English"
  );

  useEffect(() => {
    localStorage.setItem(storageKey(user?.id, "notifications"), JSON.stringify(notifications));
  }, [notifications, user?.id]);

  useEffect(() => {
    localStorage.setItem(storageKey(user?.id, "language"), language);
  }, [language, user?.id]);

  const toggleNotification = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }));

  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    try {
      setPwSaving(true);
      await changeMyPassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwSuccess("Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <div className="eyebrow">Settings</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Settings</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Manage notifications, security, and preferences.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 22, maxWidth: 640 }}>
        {/* Notifications */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Bell size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Notifications</h4>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 16 }}>Saved on this device</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {NOTIFICATION_DEFS.map(({ key, label }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13.5 }}>{label}</span>
                <Toggle checked={notifications[key]} onChange={() => toggleNotification(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Lock size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Security</h4>
          </div>

          <form onSubmit={submitPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Current password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            {pwError && <p style={{ color: "var(--risk-high)", fontSize: 13 }}>{pwError}</p>}
            {pwSuccess && <p style={{ color: "var(--risk-low)", fontSize: 13 }}>{pwSuccess}</p>}

            <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={pwSaving}>
              {pwSaving ? "Updating…" : "Change password"}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sliders size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Preferences</h4>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 16 }}>Saved on this device</p>

          <div className="field" style={{ maxWidth: 260 }}>
            <label>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
