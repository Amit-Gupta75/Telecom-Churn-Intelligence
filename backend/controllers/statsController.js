import axios from "axios";
import Customer from "../models/Customer.js";
import Prediction from "../models/Prediction.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// Build a weekly trend series from real prediction records.
// Groups predictions by ISO week and returns the avg churn probability per week.
async function buildTrend() {
  const predictions = await Prediction.find({}, { probability: 1, createdAt: 1 })
    .sort({ createdAt: 1 })
    .lean();

  if (predictions.length < 2) return [];

  // Bucket by "YYYY-Www"
  const weeks = {};
  for (const p of predictions) {
    const d = new Date(p.createdAt);
    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = start.getUTCDay() || 7;
    start.setUTCDate(start.getUTCDate() + 4 - dayOfWeek);
    const yearStart = new Date(Date.UTC(start.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((start - yearStart) / 86400000 + 1) / 7);
    const key = `W${String(weekNo).padStart(2, "0")}`;
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(p.probability);
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8) // last 8 weeks only
    .map(([label, probs]) => ({
      label,
      avgRisk: Math.round((probs.reduce((s, v) => s + v, 0) / probs.length) * 100)
    }));
}

export const getStats = async (_req, res) => {
  try {
    const [customerCount, predictionCount, trendHistory] = await Promise.all([
      Customer.countDocuments(),
      Prediction.countDocuments(),
      buildTrend()
    ]);

    let model = null;
    try {
      const { data } = await axios.get(`${AI_SERVICE_URL}/model-info`, { timeout: 3000 });
      model = data;
    } catch {
      model = null;
    }

    res.json({ customerCount, predictionCount, trendHistory, model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};