import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  createHeadOfMajor,
  getAllHeads,
  getByFacultyAndMajor,
} from "../controllers/headOfmajorController.js";

const router = express.Router();

// ✅ ต้อง login ก่อน
router.use(protect);

/**
 * @swagger
 * /api/head-of-major:
 *   get:
 *     tags:
 *       - 👔 Head of Major
 *     summary: ดูรายชื่อหัวหน้าสาขาทั้งหมด
 *     description: ดึงข้อมูลหัวหน้าสาขาทั้งหมด (admin และ teacher สามารถดูได้)
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
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   faculty:
 *                     type: string
 *                   major:
 *                     type: string
 *                   headOfMajor:
 *                     type: string
 *                     description: ชื่อหัวหน้าสาขา
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin หรือ teacher)
 *   post:
 *     tags:
 *       - 👔 Head of Major
 *     summary: เพิ่มหัวหน้าสาขา
 *     description: เพิ่มหัวหน้าสาขาใหม่ (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faculty
 *               - major
 *               - teacher
 *             properties:
 *               faculty:
 *                 type: string
 *                 example: "เทคโนโลยีสารสนเทศ TEST"
 *               major:
 *                 type: string
 *                 example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *               teacher:
 *                 type: string
 *                 description: ObjectId ของอาจารย์ในระบบ
 *                 example: "68dfc161b540e429980d52a9"
 *     responses:
 *       201:
 *         description: เพิ่มหัวหน้าสาขาสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/", authorize("admin"), createHeadOfMajor);
router.get("/", authorize("admin", "teacher"), getAllHeads);

/**
 * @swagger
 * /api/head-of-major/{faculty}/{major}:
 *   get:
 *     tags:
 *       - 👔 Head of Major
 *     summary: ดูหัวหน้าสาขาตามคณะและสาขา
 *     description: ดึงข้อมูลหัวหน้าสาขาตามคณะและสาขาที่ระบุ (admin และ teacher สามารถดูได้)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faculty
 *         required: true
 *         schema:
 *           type: string
 *         example: "เทคโนโลยีสารสนเทศ"
 *         description: ชื่อคณะ
 *       - in: path
 *         name: major
 *         required: true
 *         schema:
 *           type: string
 *         example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *         description: ชื่อสาขา
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 faculty:
 *                   type: string
 *                 major:
 *                   type: string
 *                 headOfMajor:
 *                   type: string
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบหัวหน้าสาขา
 */
router.get("/:faculty/:major", authorize("admin", "teacher"), getByFacultyAndMajor);

export default router;
