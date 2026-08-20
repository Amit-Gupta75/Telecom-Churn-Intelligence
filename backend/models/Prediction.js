import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    probability: { type: Number, required: true },
    factors: [
      {
        name: String,
        impact: Number,
        direction: { type: String, enum: ["up", "down"] }
      }
    ],
    summary: String,
    offers: [
      {
        priority: { type: String, enum: ["High", "Medium", "Low"] },
        category: String,
        title: String,
        description: String,
        riskReduction: Number
      }
    ],
    profileSnapshot: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);
