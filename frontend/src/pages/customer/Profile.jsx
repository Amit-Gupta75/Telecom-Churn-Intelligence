import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";

import { getMyProfile, updateMyProfile } from "../../services/api";
import Loading from "../../components/Loading.jsx";

export default function Profile() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const me = await getMyProfile();
      setCustomer(me);
      setForm({ name: me.name || "", phone: me.phone || "", location: me.location || "" });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setForm({ name: customer.name || "", phone: customer.phone || "", location: customer.location || "" });
    setSaveError("");
    setSaved(false);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveError("");
      const updated = await updateMyProfile(form);
      setCustomer(updated);
      setEditing(false);
      setSaved(true);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading your profile…" />;
  if (error) return <p style={{ color: "var(--risk-high)", fontSize: 13.5 }}>{error}</p>;

  return (
    <div>
      <div className="eyebrow">Profile</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>My profile</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Your account details.
      </p>

      <div className="card" style={{ padding: 22, marginTop: 22, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--signal-live)",
                color: "var(--signal-deep)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 17
              }}
            >
              {customer.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Customer since {customer.tenure ?? 0} mo. tenure</div>
            </div>
          </div>

          {!editing && (
            <button className="btn btn-ghost" onClick={startEdit}>
              <Pencil size={14} />
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Full name</label>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.name || "—"}</div>
            </div>
            <div className="field">
              <label>Email</label>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.email || "—"}</div>
            </div>
            <div className="field">
              <label>Phone</label>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.phone || "—"}</div>
            </div>
            <div className="field">
              <label>Location</label>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{customer.location || "—"}</div>
            </div>
            <div className="field">
              <label>Account ID</label>
              <div style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}>{customer._id}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Email (not editable)</label>
              <input value={customer.email || ""} disabled />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="field">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="City, region"
              />
            </div>

            {saveError && <p style={{ color: "var(--risk-high)", fontSize: 13 }}>{saveError}</p>}

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button className="btn btn-primary" disabled={saving}>
                <Check size={14} />
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                <X size={14} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {saved && !editing && (
          <p style={{ fontSize: 12.5, color: "var(--risk-low)", marginTop: 16 }}>Profile updated.</p>
        )}
      </div>
    </div>
  );
}
