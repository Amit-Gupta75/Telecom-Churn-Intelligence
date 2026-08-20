import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    type: {
      type: String,
      enum: ["complaint", "technician_visit", "installation", "billing", "other"],
      default: "other"
    },
    title: { type: String, required: true },
    notes: { type: String, default: "" },
    severity: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    occurredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Interaction", interactionSchema);
