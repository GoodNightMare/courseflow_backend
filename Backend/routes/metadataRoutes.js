import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getFaculties, getMajors } from "../controllers/metadataController.js";

const router = express.Router();

/**
 * @swagger
 * /api/faculties:
 *   get:
 *     tags:
 *       - 🔧 Metadata
 *     summary: ดูรายชื่อคณะทั้งหมด
 *     description: ดึงรายชื่อคณะทั้งหมดที่มีในระบบ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["วิทยาศาสตร์", "วิศวกรรมศาสตร์", "แพทยศาสตร์"]
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get("/faculties", protect, getFaculties);

/**
 * @swagger
 * /api/majors:
 *   get:
 *     tags:
 *       - 🔧 Metadata
 *     summary: ดูรายชื่อสาขาทั้งหมด
 *     description: ดึงรายชื่อสาขาทั้งหมดที่มีในระบบ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["วิทยาการคอมพิวเตอร์", "วิศวกรรมคอมพิวเตอร์", "วิทยาศาสตร์ข้อมูล"]
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get("/majors", protect, getMajors);

export default router;
