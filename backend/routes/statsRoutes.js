import { Router } from "express";
import { getStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "employee"), getStats);

export default router;
