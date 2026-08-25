import { Gift } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";

export default function Offers() {
  return (
    <div>
      <div className="eyebrow">Offers</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Offers for you</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Plan and service offers available on your account.
      </p>

      <div style={{ marginTop: 22 }}>
        <EmptyState
          icon={Gift}
          title="No offers available right now."
          message="Check back later for plan upgrades, add-ons, and service offers."
        />
      </div>
    </div>
  );
}
