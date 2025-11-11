import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { getProfile, getMyEnrollments, getAdvisor } from "../controllers/studentController.js";

const router = express.Router();

router.use(protect);

// student ต้องล็อกอินและ role = student เท่านั้น
//router.get("/profile", authorize("student"), getProfile);
//router.get("/enrollments", getMyEnrollments);
//router.get("/advisor", authorize("student"), getAdvisor);

export default router;
