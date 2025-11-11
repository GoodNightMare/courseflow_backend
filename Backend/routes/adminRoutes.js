// routes/adminRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getRegistrationPeriod,
  setRegistrationPeriod,
} from "../controllers/adminController.js";

const router = express.Router();

// ป้องกันให้เฉพาะ admin ใช้งาน
// router.use(protect, authorize("admin"));
router.use(protect);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: ดูรายชื่อผู้ใช้ทั้งหมด
 *     description: ดึงข้อมูลผู้ใช้ทั้งหมดในระบบ (admin และ teacher สามารถใช้งานได้)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *         description: กรองตาม role
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get("/users", authorize("admin", "teacher"), getAllUsers);

/**
 * @swagger
 * /api/admin/registration-period:
 *   get:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: ดูช่วงเวลาการลงทะเบียน
 *     description: ดึงข้อมูลช่วงเวลาที่เปิดให้ลงทะเบียน
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 isOpen:
 *                   type: boolean
 */
router.get("/registration-period", getRegistrationPeriod);

/**
 * @swagger
 * /api/admin/registration-period:
 *   post:
 *     tags:
 *       - 👨‍💼 Admin
 *     summary: ตั้งค่าช่วงเวลาการลงทะเบียน
 *     description: กำหนดช่วงเวลาที่เปิดให้ลงทะเบียน (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodName:
 *                 type: string
 *                 example: "ภาคเรียนที่ 1/2568"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-01-01T00:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59.000Z"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: ตั้งค่าสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/registration-period", authorize("admin"), setRegistrationPeriod);

export default router;
