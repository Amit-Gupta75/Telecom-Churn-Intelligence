export default function Loading({ label = "Reading signal…" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "32px 0", color: "var(--ink-muted)" }}>
      <span className="signal-bars" style={{ color: "var(--signal-mid)" }}>
        <i style={{ animation: "pulse 1s ease-in-out infinite" }}></i>
        <i style={{ animation: "pulse 1s ease-in-out 0.12s infinite" }}></i>
        <i style={{ animation: "pulse 1s ease-in-out 0.24s infinite" }}></i>
        <i style={{ animation: "pulse 1s ease-in-out 0.36s infinite" }}></i>
      </span>
      <span style={{ fontSize: 13.5 }}>{label}</span>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.35; transform: scaleY(0.7); } 50% { opacity: 1; transform: scaleY(1); } }
      `}</style>
    </div>
  );
}
