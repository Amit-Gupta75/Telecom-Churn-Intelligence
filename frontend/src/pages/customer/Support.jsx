import { useState } from "react";
import { HelpCircle, Phone, Mail, ChevronDown, MessageSquareWarning, CheckCircle2 } from "lucide-react";

import { raiseComplaint } from "../../services/api";

const FAQS = [
  {
    q: "How do I recharge my account?",
    a: "Recharge isn't available directly in the app yet — see the Recharge page for details on what's coming."
  },
  {
    q: "Where can I see my current plan and charges?",
    a: "Head to My Plan for your contract, services, and monthly charges."
  },
  {
    q: "How do I update my contact details?",
    a: "Go to Profile and select Edit to update your name, phone, or location."
  },
  {
    q: "How do I change my password?",
    a: "Go to Settings → Security and enter your current and new password."
  },
  {
    q: "How do I report an issue with my service?",
    a: "Use the Raise a complaint form below and our support team will follow up."
  }
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0",
          background: "none",
          border: "none",
          textAlign: "left",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--ink)"
        }}
      >
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: ".15s ease", flexShrink: 0 }} />
      </button>
      {open && <p style={{ fontSize: 13, color: "var(--ink-muted)", paddingBottom: 14, margin: 0 }}>{a}</p>}
    </div>
  );
}

export default function Support() {
  const [form, setForm] = useState({ title: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await raiseComplaint(form);
      setSuccess(true);
      setForm({ title: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="eyebrow">Help & support</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Help & support</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Answers to common questions, and ways to reach us.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, marginTop: 22 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <HelpCircle size={16} color="var(--signal-mid)" />
            <h4 style={{ fontSize: 15 }}>Frequently asked questions</h4>
          </div>
          <div>
            {FAQS.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22, alignSelf: "flex-start" }}>
          <h4 style={{ fontSize: 15, marginBottom: 16 }}>Contact us</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Phone size={15} color="var(--ink-faint)" />
              <span style={{ fontSize: 13.5 }}>1800-000-000 (toll-free)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Mail size={15} color="var(--ink-faint)" />
              <span style={{ fontSize: 13.5 }}>support@signaltelecom.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginTop: 20, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <MessageSquareWarning size={16} color="var(--signal-mid)" />
          <h4 style={{ fontSize: 15 }}>Raise a complaint</h4>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 16 }}>
          Tell us what went wrong and our support team will follow up.
        </p>

        {success ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} color="var(--risk-low)" />
            <span style={{ fontSize: 13.5 }}>Your complaint has been submitted. We'll be in touch.</span>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Subject</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Briefly describe the issue"
                required
              />
            </div>
            <div className="field">
              <label>Details</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add any details that might help"
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  resize: "vertical"
                }}
              />
            </div>

            {error && <p style={{ color: "var(--risk-high)", fontSize: 13 }}>{error}</p>}

            <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit complaint"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
