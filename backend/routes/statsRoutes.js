import { Router } from "express";
import { getStats } from "../controllers/statsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "employee"), getStats);

export default router;
