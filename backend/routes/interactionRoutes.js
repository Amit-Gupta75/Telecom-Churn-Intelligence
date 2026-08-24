import { Router } from "express";
import { listInteractions, addInteraction, removeInteraction } from "../controllers/interactionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:customerId", protect, listInteractions);
router.post("/", protect, authorize("admin", "employee"), addInteraction);
router.delete("/:id", protect, authorize("admin", "employee"), removeInteraction);

export default router;
