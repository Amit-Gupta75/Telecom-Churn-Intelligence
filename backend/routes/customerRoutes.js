import { Router } from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

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


const router = Router();


// Admin + Employee can view customers
router.get(
    "/",
    protect,
    authorize("admin","employee"),
    listCustomers
);


// Customer viewing their own linked record — must be registered
// before "/:id" so "me" isn't swallowed as an id param.
router.get(
    "/me",
    protect,
    authorize("customer"),
    getMyProfile
);


// Customer self-service: update own contact details / change own password
router.patch(
    "/me",
    protect,
    authorize("customer"),
    updateMyProfile
);


router.post(
    "/me/password",
    protect,
    authorize("customer"),
    changeMyPassword
);


router.get(
    "/:id",
    protect,
    authorize("admin","employee"),
    getCustomerById
);


// Admin creates a portal login for a customer, linking it to this record
router.post(
    "/:id/portal-login",
    protect,
    authorize("admin"),
    createPortalLogin
);


// Admin + Employee can create customers
router.post(
    "/",
    protect,
    authorize("admin","employee"),
    addCustomer
);


// Admin + Employee can edit customers
router.put(
    "/:id",
    protect,
    authorize("admin","employee"),
    updateCustomer
);


// Admin + Employee can delete customers
router.delete(
    "/:id",
    protect,
    authorize("admin","employee"),
    removeCustomer
);


export default router;