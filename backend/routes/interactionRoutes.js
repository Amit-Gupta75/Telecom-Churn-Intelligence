import { Router } from "express";
import { listInteractions, addInteraction, removeInteraction } from "../controllers/interactionController.js";

const router = Router();

router.get("/:customerId", listInteractions);
router.post("/", addInteraction);
router.delete("/:id", removeInteraction);

export default router;
