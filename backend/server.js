import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import customerRoutes from "./routes/customerRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users",userRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/stats", statsRoutes);
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/churnDB";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    // Still start the server so the frontend can hit /api/health during setup
    app.listen(PORT, () => console.log(`Backend running (no DB) on http://localhost:${PORT}`));
  });
