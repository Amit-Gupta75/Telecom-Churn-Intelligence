import { ArrowUpRight, ArrowDownRight } from "lucide-react";

/**
 * factors: [{ name: "Contract type", impact: 0.34, direction: "up" }, ...]
 * impact is 0..1, direction "up" pushes churn risk up, "down" pushes it down.
 */
export default function RiskFactors({ factors = [] }) {
  if (!factors.length) {
    return <p style={{ color: "var(--ink-muted)", fontSize: 13.5 }}>No factor breakdown available yet.</p>;
  }

  const maxImpact = Math.max(...factors.map((f) => f.impact), 0.01);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {factors.map((f) => {
        const isUp = f.direction === "up";
        const width = Math.round((f.impact / maxImpact) * 100);
        return (
          <div key={f.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
                {isUp ? (
                  <ArrowUpRight size={14} color="var(--risk-high)" />
                ) : (
                  <ArrowDownRight size={14} color="var(--risk-low)" />
                )}
                {f.name}
              </span>
              <span style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
                {(f.impact * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface-sunken)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${width}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: isUp ? "var(--risk-high)" : "var(--risk-low)"
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
