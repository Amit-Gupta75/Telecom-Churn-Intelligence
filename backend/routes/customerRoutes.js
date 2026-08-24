import { Router } from "express";

import {
  listCustomers,
  getCustomerById,
  addCustomer,
  removeCustomer,
  updateCustomer
} from "../controllers/customerController.js";


const router = Router();


router.get("/", listCustomers);

router.get("/:id", getCustomerById);

router.post("/", addCustomer);

router.put("/:id", updateCustomer);

router.delete("/:id", removeCustomer);


export default router;