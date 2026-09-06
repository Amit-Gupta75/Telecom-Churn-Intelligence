import { Router } from "express";

import {
    listCustomers,
    getCustomerById,
    addCustomer,
    removeCustomer,
    updateCustomer,
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
    createPortalLogin
} from "../controllers/customerController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";


const router = Router();

// NOTE: "/me" routes must be declared BEFORE "/:id" — otherwise Express
// matches "/me" against the "/:id" pattern first (treating "me" as an id)
// and these would never be reached.

// The logged-in customer's own profile.
router.get("/me", protect, getMyProfile);
router.patch("/me", protect, updateMyProfile);
router.post("/me/password", protect, changeMyPassword);

// Any logged-in user (admin/employee/customer) can view customers.
router.get("/", protect, listCustomers);

router.get("/:id", protect, getCustomerById);

// Only admin/employee can create, update or delete customer records.
router.post("/", protect, authorize("admin", "employee"), addCustomer);

router.put("/:id", protect, authorize("admin", "employee"), updateCustomer);

router.delete("/:id", protect, authorize("admin", "employee"), removeCustomer);

// Admin/employee create a portal login for an existing customer record.
router.post("/:id/portal-login", protect, authorize("admin", "employee"), createPortalLogin);

export default router;