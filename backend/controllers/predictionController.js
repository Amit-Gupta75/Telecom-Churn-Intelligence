import axios from "axios";
import Customer from "../models/Customer.js";
import Prediction from "../models/Prediction.js";


const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/predictions  — forwards the customer profile to the Python AI
// service, stores the result, and updates the customer's churnProbability.
export const runPrediction = async (req, res) => {
  const { customerId, ...profile } = req.body;

  try {
    const { data } = await axios.post(`${AI_SERVICE_URL}/predict`, profile);
    // data: { probability, factors, summary, offers }

    if (customerId) {
      // Keep the customer record's own fields in sync with the latest
      // profile that was actually scored, plus their new risk score.
      await Customer.findByIdAndUpdate(customerId, {
        churnProbability: data.probability,
        tenure: profile.tenure,
        monthlyCharges: profile.monthlyCharges,
        totalCharges: profile.totalCharges,
        contract: profile.contract,
        internetService: profile.internetService,
        paymentMethod: profile.paymentMethod,
        techSupport: profile.techSupport,
        onlineSecurity: profile.onlineSecurity,
        onlineBackup: profile.onlineBackup,
        deviceProtection: profile.deviceProtection,
        streamingTV: profile.streamingTV,
        streamingMovies: profile.streamingMovies,
        paperlessBilling: profile.paperlessBilling,
        gender: profile.gender,
        seniorCitizen: profile.seniorCitizen,
        partner: profile.partner,
        dependents: profile.dependents,
        multipleLines: profile.multipleLines
      });

      // Store this prediction as a full historical record, including a
      // snapshot of every field submitted for it — so past predictions
      // remain meaningful even if the customer's profile changes later.
      await Prediction.create({ customer: customerId, ...data, profileSnapshot: profile });
    }

    res.json(data);
  } catch (err) {
    console.error("AI service error:", err.message);
    res.status(502).json({ error: "AI service unavailable", detail: err.message });
  }
};

export const predictionHistory = async (req, res) => {
  try {
    if (req.user.role === "customer" && String(req.user.customer) !== req.params.customerId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const history = await Prediction.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const allPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .populate("customer", "name location");

    res.json(predictions);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
