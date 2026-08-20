import { Layers } from "lucide-react";

function activeServices(customer) {
  if (!customer) return [];
  const services = [];

  if (customer.internetService && customer.internetService !== "No") {
    services.push(`${customer.internetService} Internet`);
  }
  if (customer.multipleLines && customer.multipleLines !== "No phone service") {
    services.push(customer.multipleLines === "Yes" ? "Phone Service (multiple lines)" : "Phone Service");
  }
  if (customer.onlineSecurity === "Yes") services.push("Online Security");
  if (customer.onlineBackup === "Yes") services.push("Online Backup");
  if (customer.deviceProtection === "Yes") services.push("Device Protection");
  if (customer.techSupport === "Yes") services.push("Tech Support");
  if (customer.streamingTV === "Yes") services.push("Streaming TV");
  if (customer.streamingMovies === "Yes") services.push("Streaming Movies");

  return services;
}

export default function ServicesSubscribed({ customer }) {
  const services = activeServices(customer);

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Layers size={16} color="var(--signal-mid)" />
        <h4 style={{ fontSize: 15 }}>Services subscribed</h4>
      </div>
      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 14 }}>
        {services.length} active service{services.length === 1 ? "" : "s"}
      </p>

      {services.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>No active add-on services.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          {services.map((s) => (
            <li key={s} style={{ fontSize: 13.5, color: "var(--ink)" }}>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
