import express from "express";
import {
  createPattern,
  getAllPatterns,
  getPatternById,
  updatePattern,
  deletePattern,
  addCourseToPattern,
  getPatternsForUser
} from "../controllers/patternController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/patterns:
 *   get:
 *     tags:
 *       - 📋 Patterns
 *     summary: ดู Pattern ทั้งหมด
 *     description: ดึงข้อมูล Pattern ทั้งหมดในระบบ
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
 *                 $ref: '#/components/schemas/Pattern'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   post:
 *     tags:
 *       - 📋 Patterns
 *     summary: สร้าง Pattern ใหม่
 *     description: สร้าง Pattern ใหม่ในระบบ (เฉพาะ admin) - ใช้หลังจากอนุมัติ Pattern Request แล้ว
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - faculties
 *             properties:
 *               year:
 *                 type: string
 *                 example: "2568"
 *               faculties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     facultyName:
 *                       type: string
 *                       example: "เทคโนโลยีสารสนเทศ"
 *                     majors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           majorName:
 *                             type: string
 *                             example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *                           years:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 yearLevel:
 *                                   type: number
 *                                   example: 3
 *                                 semesters:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       semesterNumber:
 *                                         type: number
 *                                         example: 1
 *                                       patterns:
 *                                         type: array
 *                                         items:
 *                                           type: object
 *                                           properties:
 *                                             patternName:
 *                                               type: string
 *                                               example: "Pattern 99"
 *                                             courses:
 *                                               type: array
 *                                               items:
 *                                                 type: object
 *                                                 properties:
 *                                                   course_id:
 *                                                     type: string
 *                                                     example: "68e29796a4be9e5a4eadcb81"
 *                                                   sections:
 *                                                     type: array
 *                                                     items:
 *                                                       type: object
 *                                                       properties:
 *                                                         section_id:
 *                                                           type: string
 *                                                           example: "68e403e72f265d2dd7a02bbf"
 *     responses:
 *       201:
 *         description: สร้าง Pattern สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/", authorize("admin"), createPattern);
router.get("/", getAllPatterns);

/**
 * @swagger
 * /api/patterns/user/{user_id}:
 *   get:
 *     tags:
 *       - 📋 Patterns
 *     summary: ดู Pattern ของ User
 *     description: ดึง Pattern ที่เหมาะสมสำหรับ user นั้นๆ ตามคณะ, สาขา, ชั้นปี
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68dfc078b8c0f4ba5eac0575"
 *         description: User ID
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pattern'
 *       404:
 *         description: ไม่พบ Pattern
 */
router.get("/user/:user_id", getPatternsForUser);

/**
 * @swagger
 * /api/patterns/{id}:
 *   get:
 *     tags:
 *       - 📋 Patterns
 *     summary: ดู Pattern ตาม ID
 *     description: ดึงข้อมูล Pattern ตาม ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "690c81729a51c420fb59e3a3"
 *         description: Pattern ID
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pattern'
 *       404:
 *         description: ไม่พบ Pattern
 */
router.get("/:id", getPatternById);

/**
 * @swagger
 * /api/patterns/{id}/{year}:
 *   delete:
 *     tags:
 *       - 📋 Patterns
 *     summary: ลบ Pattern
 *     description: ลบ Pattern ตาม ID และปีการศึกษา (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "690c81729a51c420fb59e3a3"
 *         description: Pattern ID
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *         example: "2568"
 *         description: ปีการศึกษา
 *     responses:
 *       200:
 *         description: ลบ Pattern สำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 *       404:
 *         description: ไม่พบ Pattern
 */
router.delete("/:id/:year", authorize("admin"), deletePattern);

export default router;
