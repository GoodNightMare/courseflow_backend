import express from "express";
import {
  createPatternRequest,
  getAllPatternRequests,
  getMyPatternRequests,
  approvePatternRequest,
  rejectPatternRequest,
  getAllYears,
  generatePatternName
} from "../controllers/patternRequestController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/pattern-requests:
 *   get:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: ดูคำขอสร้าง Pattern ทั้งหมด
 *     description: ดึงคำขอสร้าง Pattern ทั้งหมด (เฉพาะ admin) - สามารถกรองตามเงื่อนไขได้
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
 *                 $ref: '#/components/schemas/PatternRequest'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
  *   post:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: สร้างคำขอ Pattern ใหม่
 *     description: อาจารย์สร้างคำขอ Pattern ใหม่เพื่อส่งให้ admin อนุมัติ (เฉพาะ teacher)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patternName
 *               - faculty
 *               - major
 *               - year
 *               - yearLevel
 *               - semester
 *               - courses
 *             properties:
 *               patternName:
 *                 type: string
 *                 example: "Pattern 191"
 *               faculty:
 *                 type: string
 *                 example: "เทคโนโลยีสารสนเทศ"
 *               major:
 *                 type: string
 *                 example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *               year:
 *                 type: string
 *                 example: "2568"
 *               yearLevel:
 *                 type: number
 *                 example: 3
 *               semester:
 *                 type: number
 *                 example: 1
 *               courses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - course_id
 *                     - sections
 *                   properties:
 *                     course_id:
 *                       type: string
 *                       example: "68e29958a4be9e5a4eadcba4"
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - section_id
 *                           - section_number
 *                           - type
 *                           - teacher_id
 *                           - schedules
 *                         properties:
 *                           section_id:
 *                             type: string
 *                             example: "68e29d82a4be9e5a4eadcbad"
 *                           section_number:
 *                             type: string
 *                             example: "T099"
 *                           type:
 *                             type: string
 *                             enum: [lecture, lab]
 *                             example: "lecture"
 *                           teacher_id:
 *                             type: string
 *                             example: "68e29d70a4be9e5a4eadcba9"
 *                           schedules:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 day:
 *                                   type: string
 *                                   example: "Monday"
 *                                 time:
 *                                   type: string
 *                                   example: "09:00 - 10:40"
 *                                 location:
 *                                   type: string
 *                                   example: "05-0309"
 *     responses:
 *       201:
 *         description: สร้างคำขอสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น teacher)
 */
router.post("/", authorize("teacher"), createPatternRequest);
router.get("/", authorize("admin"), getAllPatternRequests);

/**
 * @swagger
 * /api/pattern-requests/my-requests:
 *   get:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: ดูคำขอของตัวเอง
 *     description: อาจารย์ดูคำขอ Pattern ที่ตัวเองสร้าง (เฉพาะ teacher)
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
 *                 $ref: '#/components/schemas/PatternRequest'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น teacher)
 */
router.get("/my-requests", authorize("teacher"), getMyPatternRequests);

/**
 * @swagger
 * /api/pattern-requests/{id}/approve:
 *   patch:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: อนุมัติคำขอ Pattern
 *     description: Admin อนุมัติคำขอสร้าง Pattern (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "690c8652e7a70131c691d94c"
 *         description: Pattern Request ID
 *     responses:
 *       200:
 *         description: อนุมัติสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 *       404:
 *         description: ไม่พบคำขอ
 */
router.patch("/:id/approve", authorize("admin"), approvePatternRequest);

/**
 * @swagger
 * /api/pattern-requests/{id}/reject:
 *   patch:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: ไม่อนุมัติคำขอ Pattern
 *     description: Admin ไม่อนุมัติคำขอสร้าง Pattern พร้อมระบุเหตุผล (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "690ae8d8592c5ca64b621661"
 *         description: Pattern Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "รายวิชาไม่ครบตามหลักสูตร"
 *     responses:
 *       200:
 *         description: ไม่อนุมัติสำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 *       404:
 *         description: ไม่พบคำขอ
 */
router.patch("/:id/reject", authorize("admin"), rejectPatternRequest);

/**
 * @swagger
 * /api/pattern-requests/years:
 *   get:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: ดูรายการปีการศึกษา
 *     description: ดึงรายการปีการศึกษาทั้งหมดที่มีใน Pattern Requests
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
 *                 example: "2567"
 */
router.get("/years", getAllYears);

/**
 * @swagger
 * /api/pattern-requests/generate-name:
 *   get:
 *     tags:
 *       - 📄 Pattern Requests
 *     summary: สร้างชื่อ Pattern อัตโนมัติ
 *     description: สร้างชื่อ Pattern แบบอัตโนมัติตามคณะ, สาขา, ปี (เฉพาะ teacher)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: faculty
 *         required: true
 *         schema:
 *           type: string
 *           example: "เทคโนโลยีสารสนเทศ"
 *         description: ชื่อคณะ
 *       - in: query
 *         name: major
 *         required: true
 *         schema:
 *           type: string
 *           example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *         description: ชื่อสาขา
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *           example: "2568"
 *         description: ปีการศึกษา
 *       - in: query
 *         name: yearLevel
 *         required: true
 *         schema:
 *           type: number
 *           example: 3
 *         description: ชั้นปี เช่น 1, 2, 3, 4
 *       - in: query
 *         name: semester
 *         required: true
 *         schema:
 *           type: number
 *           example: 1
 *         description: เทอมที่เรียน เช่น 1 หรือ 2
 *     responses:
 *       200:
 *         description: สร้างชื่อ Pattern สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patternName:
 *                   type: string
 *                   example: "Pattern A - วิทยาการคอมพิวเตอร์ ปี 3 เทอม 1"
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get("/generate-name", authorize("teacher"), generatePatternName);

export default router;
