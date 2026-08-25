import { Router } from "express";
import {
  runPrediction,
  predictionHistory,
  allPredictions
} from "../controllers/predictionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "employee"), allPredictions);

router.post("/", protect, authorize("admin", "employee"), runPrediction);

// Admin/employee can view any customer's history; a customer can only
// view their own (enforced inside the controller).
router.get("/:customerId", protect, authorize("admin", "employee", "customer"), predictionHistory);

export default router;