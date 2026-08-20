import { useNavigate } from "react-router-dom";

function riskBadge(prob) {
  if (prob == null) return <span className="badge" style={{ background: "var(--surface-sunken)", color: "var(--ink-muted)" }}>Not scored</span>;
  if (prob >= 0.66) return <span className="badge badge-high">High</span>;
  if (prob >= 0.33) return <span className="badge badge-medium">Medium</span>;
  return <span className="badge badge-low">Low</span>;
}

export default function CustomerTable({ customers = [] }) {
  const navigate = useNavigate();

  if (!customers.length) {
    return <p style={{ color: "var(--ink-muted)", fontSize: 13.5, padding: "20px 0" }}>No customers yet — add one to get started.</p>;
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contract</th>
            <th>Tenure</th>
            <th>Monthly charges</th>
            <th>Churn risk</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id || c.id} onClick={() => navigate(`/customers/${c._id || c.id}`)}>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td>{c.contract}</td>
              <td>{c.tenure} mo</td>
              <td>${Number(c.monthlyCharges).toFixed(2)}</td>
              <td>{riskBadge(c.churnProbability)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
