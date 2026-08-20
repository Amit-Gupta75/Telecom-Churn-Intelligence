import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Zap, X } from "lucide-react";
import CustomerForm from "../components/CustomerForm.jsx";
import CustomerHeaderCard from "../components/CustomerHeaderCard.jsx";
import WhyChurn from "../components/WhyChurn.jsx";
import BillingSummary from "../components/BillingSummary.jsx";
import ServicesSubscribed from "../components/ServicesSubscribed.jsx";
import SupportHistory from "../components/SupportHistory.jsx";
import RetentionOffer from "../components/RetentionOffer.jsx";
import PredictionHistory from "../components/PredictionHistory.jsx";
import Loading from "../components/Loading.jsx";
import {
  getCustomer,
  predictChurn,
  getPredictionHistory,
  getInteractions,
  addInteraction
} from "../services/api.js";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadHistory = () => {
    getPredictionHistory(id)
      .then((data) => {
        setHistory(data);
        // Always reflect the most recent known result on load, so the
        // dashboard shows current state without requiring a fresh run.
        if (data.length > 0) setResult((prev) => prev ?? data[0]);
      })
      .catch(() => setHistory([]));
  };

  const loadInteractions = () => {
    getInteractions(id).then(setInteractions).catch(() => setInteractions([]));
  };

  useEffect(() => {
    getCustomer(id).then(setCustomer).catch(() => setCustomer(null));
    loadHistory();
    loadInteractions();
  }, [id]);

  const handlePredict = async (formData) => {
    setPredicting(true);
    setError(null);
    try {
      const res = await predictChurn({ customerId: id, ...formData });
      setResult(res);
      setShowForm(false);
      loadHistory();
      getCustomer(id).then(setCustomer).catch(() => {});
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.response?.data?.error || err.message || "Prediction failed.";
      setError(detail);
    } finally {
      setPredicting(false);
    }
  };

  const handleAddInteraction = async (payload) => {
    await addInteraction({ customer: id, ...payload });
    loadInteractions();
  };

  return (
    <div>
      <CustomerHeaderCard customer={customer} probability={result?.probability} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Zap size={16} />}
          {showForm ? "Close" : "Run new prediction"}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 20, maxWidth: 480 }}>
          <CustomerForm onSubmit={handlePredict} loading={predicting} />
        </div>
      )}

      {predicting && <Loading label="Scoring churn risk…" />}

      {!predicting && error && (
        <div
          className="card"
          style={{ padding: 24, color: "var(--risk-high)", fontSize: 13.5, border: "1px solid var(--risk-high)", marginBottom: 20 }}
        >
          <strong>Prediction failed:</strong> {error}
          <div style={{ marginTop: 8, color: "var(--ink-muted)" }}>
            Check that the backend (port 5000) and the AI service (port 8000) are both running.
          </div>
        </div>
      )}

      {customer && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
            {result && <WhyChurn factors={result.factors} summary={result.summary} />}
            <BillingSummary
              monthlyCharges={customer.monthlyCharges}
              totalCharges={customer.totalCharges}
              paymentMethod={customer.paymentMethod}
              probability={result?.probability ?? customer.churnProbability}
            />
            <ServicesSubscribed customer={customer} />
            <SupportHistory interactions={interactions} onAdd={handleAddInteraction} />
          </div>

          {result?.offers && (
            <div style={{ marginBottom: 20 }}>
              <RetentionOffer offers={result.offers} />
            </div>
          )}

          <PredictionHistory history={history} />
        </>
      )}
    </div>
  );
}
