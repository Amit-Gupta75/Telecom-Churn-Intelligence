import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
 
const initial = {
  tenure: "",
  monthlyCharges: "",
  totalCharges: "",
  contract: "Month-to-month",
  internetService: "Fiber optic",
  paymentMethod: "Electronic check",
  techSupport: "No",
  onlineSecurity: "No",
  onlineBackup: "No",
  deviceProtection: "No",
  streamingTV: "No",
  streamingMovies: "No",
  paperlessBilling: "Yes",
  gender: "Female",
  seniorCitizen: "0",
  partner: "No",
  dependents: "No",
  multipleLines: "No"
};
 
export default function CustomerForm({customer,setCustomer,onSubmit,
  loading,
  mode = "create"
}) {
  const [form, setForm] = useState(customer || initial); 
  useEffect(() => {

  if(customer){
    setForm(customer);
  }

},[customer]);



const update = (key) => (e) => {

const value = e.target.value;

setForm((f)=>({
 ...f,
 [key]:value
}));

if(setCustomer){

 setCustomer((f)=>({
   ...f,
   [key]:value
 }));

}

};
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
 
  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: 16, marginBottom: 4 }}>Customer profile</h3>
      <p style={{ fontSize: 12.5, color: "var(--ink-muted)", marginBottom: 18 }}>Account &amp; billing</p>
 
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <div className="field">
          <label>Tenure (months)</label>
          <input type="number" min="0" required value={form.tenure} onChange={update("tenure")} placeholder="e.g. 14" />
        </div>
        <div className="field">
          <label>Monthly charges ($)</label>
          <input type="number" min="0" step="0.01" required value={form.monthlyCharges} onChange={update("monthlyCharges")} placeholder="e.g. 79.99" />
        </div>
        <div className="field">
          <label>Total charges ($)</label>
          <input type="number" min="0" step="0.01" required value={form.totalCharges} onChange={update("totalCharges")} placeholder="e.g. 1120.35" />
        </div>
        <div className="field">
          <label>Contract</label>
          <select value={form.contract} onChange={update("contract")}>
            <option>Month-to-month</option>
            <option>One year</option>
            <option>Two year</option>
          </select>
        </div>
        <div className="field">
          <label>Payment method</label>
          <select value={form.paymentMethod} onChange={update("paymentMethod")}>
            <option>Electronic check</option>
            <option>Mailed check</option>
            <option>Bank transfer (automatic)</option>
            <option>Credit card (automatic)</option>
          </select>
        </div>
        <div className="field">
          <label>Paperless billing</label>
          <select value={form.paperlessBilling} onChange={update("paperlessBilling")}>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>
 
      <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "18px 0 10px" }}>Services</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <div className="field">
          <label>Internet service</label>
          <select value={form.internetService} onChange={update("internetService")}>
            <option>Fiber optic</option>
            <option>DSL</option>
            <option>No</option>
          </select>
        </div>
        <div className="field">
          <label>Multiple lines</label>
          <select value={form.multipleLines} onChange={update("multipleLines")}>
            <option>No</option>
            <option>Yes</option>
            <option>No phone service</option>
          </select>
        </div>
        <div className="field">
          <label>Tech support</label>
          <select value={form.techSupport} onChange={update("techSupport")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Online security</label>
          <select value={form.onlineSecurity} onChange={update("onlineSecurity")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Online backup</label>
          <select value={form.onlineBackup} onChange={update("onlineBackup")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Device protection</label>
          <select value={form.deviceProtection} onChange={update("deviceProtection")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Streaming TV</label>
          <select value={form.streamingTV} onChange={update("streamingTV")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Streaming movies</label>
          <select value={form.streamingMovies} onChange={update("streamingMovies")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
      </div>
 
      <p style={{ fontSize: 12.5, color: "var(--ink-muted)", margin: "18px 0 10px" }}>Demographics</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <div className="field">
          <label>Gender</label>
          <select value={form.gender} onChange={update("gender")}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </div>
        <div className="field">
          <label>Senior citizen</label>
          <select value={form.seniorCitizen} onChange={update("seniorCitizen")}>
            <option value="0">No</option>
            <option value="1">Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Has partner</label>
          <select value={form.partner} onChange={update("partner")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="field">
          <label>Has dependents</label>
          <select value={form.dependents} onChange={update("dependents")}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
      </div>
 
      <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 20, width: "100%", justifyContent: "center" }}>
        <Zap size={16} />
        {
          loading
          ?
          "Saving..."
          :
          mode==="edit"
          ?
          "Update customer"
          :
          "Predict churn risk"
          }
      </button>
    </form>
  );
}
 