import { Activity } from "lucide-react";
import EmptyState from "../../components/EmptyState.jsx";

export default function Usage() {
  return (
    <div>
      <div className="eyebrow">Usage</div>
      <h1 style={{ fontSize: 26, marginTop: 4 }}>Data, calls & SMS</h1>
      <p style={{ color: "var(--ink-muted)", marginTop: 6, fontSize: 13.5 }}>
        Track how much of your plan you&apos;ve used.
      </p>

      <div style={{ marginTop: 22 }}>
        <EmptyState
          icon={Activity}
          title="Usage information is currently unavailable"
          message="We don't have usage data on file for your account yet, so we can't show data, call, or SMS consumption right now."
          note="Backend work required: usage-metering data (a UsageRecord model or telecom-network integration) plus a GET /api/customers/me/usage endpoint to expose current-cycle and historical consumption."
        />
      </div>
    </div>
  );
}
