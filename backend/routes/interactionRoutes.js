import { Router } from "express";
import { listInteractions, listAllInteractions, addInteraction, removeInteraction } from "../controllers/interactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", protect, authorize("admin", "employee"), listAllInteractions);

// Admin/employee can view any customer's interactions; a customer can
// only view their own (enforced inside the controller).
router.get("/:customerId", protect, authorize("admin", "employee", "customer"), listInteractions);

// Admin/employee can log any interaction type; a customer can only raise
// a complaint against their own record (enforced inside the controller).
router.post(
  "/",
  protect,
  authorize("admin", "employee", "customer"),
  addInteraction
);

router.delete("/:id", protect, authorize("admin"), removeInteraction);

export default router;
