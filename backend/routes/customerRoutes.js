import { Router } from "express";

import {
  listCustomers,
  getCustomerById,
  addCustomer,
  removeCustomer,
  updateCustomer
} from "../controllers/customerController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";


const router = Router();

// Any logged-in user (admin/employee/customer) can view customers.
router.get("/", protect, listCustomers);

router.get("/:id", protect, getCustomerById);

// Only admin/employee can create, update or delete customer records.
router.post("/", protect, authorize("admin", "employee"), addCustomer);

router.put("/:id", protect, authorize("admin", "employee"), updateCustomer);

router.delete("/:id", protect, authorize("admin", "employee"), removeCustomer);


export default router;
