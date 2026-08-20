import { Router } from "express";
import { listCustomers, getCustomerById, addCustomer, removeCustomer } from "../controllers/customerController.js";

const router = Router();

router.get("/", listCustomers);
router.get("/:id", getCustomerById);
router.post("/", addCustomer);
router.delete("/:id", removeCustomer);

export default router;
