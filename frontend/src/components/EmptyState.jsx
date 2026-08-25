export default function EmptyState({ icon: Icon, title, message, note }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: "center" }}>
      {Icon && (
        <span
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "var(--surface-sunken)",
            color: "var(--ink-faint)",
            margin: "0 auto"
          }}
        >
          <Icon size={24} />
        </span>
      )}

      <h3 style={{ fontSize: 17, marginTop: 16 }}>{title}</h3>

      {message && (
        <p style={{ fontSize: 13.5, color: "var(--ink-muted)", marginTop: 8, maxWidth: 440, marginInline: "auto" }}>
          {message}
        </p>
      )}

      {note && (
        <p
          style={{
            fontSize: 11.5,
            color: "var(--ink-faint)",
            marginTop: 14,
            fontFamily: "var(--font-mono)",
            maxWidth: 460,
            marginInline: "auto",
            lineHeight: 1.6
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}
