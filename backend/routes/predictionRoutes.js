import { Router } from "express";
import {
  runPrediction,
  predictionHistory,
  allPredictions
} from "../controllers/predictionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "employee"), allPredictions);

router.post("/", protect, authorize("admin", "employee"), runPrediction);

router.get("/:customerId", protect, predictionHistory);

export default router;
