// routes/enrollmentRoutes.js
import express from "express";
import {
  enrollSection,
  unenrollSection,
  countEnrolledStudents,
  syncSectionSeats,
  checkSectionAvailability,
  getMyEnrollments,
  syncAllSectionSeats,
  getEnrollmentStats,
  getEnrollments,
  getDashboardStats,
} from "../controllers/enrollmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/enrollments/enroll:
 *   post:
 *     tags:
 *       - 📝 Enrollments
 *     summary: ลงทะเบียนเรียน
 *     description: |
 *       ใช้สำหรับให้นักศึกษาลงทะเบียนในรายวิชาและ Section ที่ต้องการ  
 *       สามารถลงทะเบียนหลายวิชาได้ในครั้งเดียว  
 *       
 *       **หมายเหตุ:**  
 *       - ต้องเข้าสู่ระบบด้วย role = student  
 *       - หาก Section เต็ม จะไม่สามารถลงทะเบียนได้
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - courses
 *             properties:
 *               student_id:
 *                 type: string
 *                 example: "690c73022094851c2429368b"
 *                 description: ObjectId ของนักศึกษา
 *               courses:
 *                 type: array
 *                 description: รายวิชาที่ต้องการลงทะเบียน
 *                 items:
 *                   type: object
 *                   required:
 *                     - course_id
 *                     - sections
 *                   properties:
 *                     course_id:
 *                       type: string
 *                       example: "68e29843a4be9e5a4eadcb8d"
 *                       description: ObjectId ของรายวิชา
 *                     sections:
 *                       type: array
 *                       description: รายการ Section ที่ต้องการลงในรายวิชานี้
 *                       items:
 *                         type: object
 *                         required:
 *                           - section_id
 *                         properties:
 *                           section_id:
 *                             type: string
 *                             example: "690c7bb38e7c887b9efa7213"
 *                             description: ObjectId ของ Section
 *                           grade:
 *                             type: string
 *                             nullable: true
 *                             example: ""
 *                             description: เกรด (เพิ่มภายหลังจากประเมินผล)
 *                           status:
 *                             type: string
 *                             enum: [enrolled, dropped, completed]
 *                             example: "enrolled"
 *                             description: สถานะการลงทะเบียนใน section นั้น
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือเวลาซ้ำซ้อน
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.post("/enroll", enrollSection);

/**
 * @swagger
 * /api/enrollments/unenroll:
 *   post:
 *     tags:
 *       - 📝 Enrollments
 *     summary: ถอนการลงทะเบียน
 *     description: ถอนการลงทะเบียนออกจากวิชาและ section ที่เลือก
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - course_id
 *               - section_id
 *             properties:
 *               student_id:
 *                 type: string
 *                 example: "690c73022094851c2429368b"
 *               course_id:
 *                 type: string
 *                 example: "68e29843a4be9e5a4eadcb8d"
 *               section_id:
 *                 type: string
 *                 example: "690c7bb38e7c887b9efa7213"
 *     responses:
 *       200:
 *         description: ถอนการลงทะเบียนสำเร็จ
 *       404:
 *         description: ไม่พบการลงทะเบียน
 */
router.post("/unenroll", unenrollSection);

/**
 * @swagger
 * /api/enrollments/my-enrollments/{student_id}:
 *   get:
 *     tags:
 *       - 📝 Enrollments
 *     summary: ดูรายวิชาที่ลงทะเบียนแล้ว
 *     description: ดึงรายวิชาทั้งหมดที่นักเรียนลงทะเบียนไว้
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "68dfc001b8c0f4ba5eac0571"
 *         description: รหัสนักเรียน
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: ไม่พบข้อมูล
 */
router.get("/my-enrollments/:student_id", getMyEnrollments);

/**
 * @swagger
 * /api/enrollments/sync-all:
 *   post:
 *     tags:
 *       - 📝 Enrollments
 *     summary: ซิงค์ที่นั่งทั้งหมด
 *     description: ซิงค์จำนวนที่นั่งว่างของทุก section ในระบบ (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ซิงค์สำเร็จ
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/sync-all", authorize("admin"), syncAllSectionSeats);

/**
 * @swagger
 * /api/enrollments/dashboard-stats:
 *   get:
 *     tags:
 *       - 📝 Enrollments
 *     summary: สถิติ Dashboard
 *     description: |
 *       ดึงสถิติการลงทะเบียนนักศึกษาในแต่ละคณะ/สาขา/ปีการศึกษา  
 *       ใช้แสดงผลในหน้า Dashboard (เฉพาะ admin เท่านั้น)
 *       
 *       สามารถกรองผลลัพธ์ด้วย query parameters:
 *       - `faculty` → ชื่อคณะ
 *       - `major` → ชื่อสาขา
 *       - `year` → ปีการศึกษา เช่น 2568
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: faculty
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อคณะ
 *         example: "เทคโนโลยีสารสนเทศ"
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *         required: false
 *         description: ชื่อสาขา
 *         example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         required: false
 *         description: ปีการศึกษา (เช่น 2568)
 *         example: "2568"
 *     responses:
 *       200:
 *         description: ✅ ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStudents:
 *                   type: number
 *                   description: จำนวนนักศึกษาทั้งหมด
 *                   example: 120
 *                 enrolledStudents:
 *                   type: number
 *                   description: จำนวนนักศึกษาที่ลงทะเบียนแล้ว
 *                   example: 100
 *                 unenrolledStudents:
 *                   type: number
 *                   description: จำนวนนักศึกษาที่ยังไม่ได้ลงทะเบียน
 *                   example: 20
 *                 enrollmentRate:
 *                   type: number
 *                   description: อัตราการลงทะเบียน (%)
 *                   example: 83.3
 *       401:
 *         description: 🔒 ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Unauthorized: Missing or invalid token"
 *       404:
 *         description: ❌ ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "ไม่พบข้อมูลการลงทะเบียนในปีที่ระบุ"
 */
router.get("/dashboard-stats", authorize("admin"), getDashboardStats);

export default router;
