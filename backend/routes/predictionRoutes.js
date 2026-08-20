import { Router } from "express";
import { runPrediction, predictionHistory } from "../controllers/predictionController.js";

const router = Router();

router.post("/", runPrediction);
router.get("/:customerId", predictionHistory);

export default router;
