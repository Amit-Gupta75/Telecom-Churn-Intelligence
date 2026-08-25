import {Router} from "express";

import {
getEmployees,
getEmployeeById,
createEmployee,
deleteEmployee
}
from "../controllers/userController.js";


import {protect}
from "../middleware/authMiddleware.js";


import {authorize}
from "../middleware/roleMiddleware.js";


const router = Router();



// ADMIN VIEW EMPLOYEES
router.get(
"/employees",
protect,
authorize("admin"),
getEmployees
);



// ADMIN VIEW SINGLE EMPLOYEE
router.get(
"/employees/:id",
protect,
authorize("admin"),
getEmployeeById
);



// ADMIN CREATE EMPLOYEE
router.post(
"/employees",
protect,
authorize("admin"),
createEmployee
);



// ADMIN DELETE EMPLOYEE
router.delete(
"/employees/:id",
protect,
authorize("admin"),
deleteEmployee
);



export default router;