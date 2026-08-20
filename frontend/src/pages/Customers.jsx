import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import CustomerTable from "../components/CustomerTable.jsx";
import Loading from "../components/Loading.jsx";
import { getCustomers, createCustomer } from "../services/api.js";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const quickAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createCustomer({
      name,
      location,
      tenure: 0,
      monthlyCharges: 0,
      totalCharges: 0,
      contract: "Month-to-month"
    });
    setName("");
    setLocation("");
    setShowForm(false);
    load();
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div className="eyebrow">Customers</div>
          <h1 style={{ fontSize: 26, marginTop: 4 }}>All customers</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          <UserPlus size={16} />
          Add customer
        </button>
      </header>

      {showForm && (
        <form onSubmit={quickAdd} className="card" style={{ padding: 16, marginBottom: 18, display: "flex", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Customer name"
            required
            style={{ flex: 2, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (optional)"
            style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8 }}
          />
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}

      {loading ? <Loading /> : <CustomerTable customers={customers} />}
    </div>
  );
}
