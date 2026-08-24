import { Router } from "express";
import {
  runPrediction,
  predictionHistory,
  allPredictions
} from "../controllers/predictionController.js";

const router = Router();

router.get("/", allPredictions);

router.post("/", runPrediction);

router.get("/:customerId", predictionHistory);

export default router;