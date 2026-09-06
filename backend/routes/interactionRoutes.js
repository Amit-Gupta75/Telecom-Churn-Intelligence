import { Router } from "express";
import {
  listInteractions,
  listAllInteractions,
  addInteraction,
  removeInteraction
} from "../controllers/interactionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// NOTE: "/" must come before "/:customerId" so admin/employee viewing the
// full list doesn't accidentally get captured by the customerId route.

// GET /api/interactions — admin/employee only, across all customers.
router.get("/", protect, authorize("admin", "employee"), listAllInteractions);

router.get("/:customerId", protect, listInteractions);

// POST /api/interactions — admin/employee log any interaction, and a
// logged-in customer can use the same endpoint to raise their own
// complaint (addInteraction handles that branch based on req.user.role).
router.post("/", protect, authorize("admin", "employee", "customer"), addInteraction);

router.delete("/:id", protect, authorize("admin", "employee"), removeInteraction);

export default router;
