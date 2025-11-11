import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addSection,
  getSections,
  approveSection,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - 📚 Courses
 *     summary: ดูรายวิชาทั้งหมด
 *     description: ดึงข้อมูลรายวิชาทั้งหมดในระบบ (สามารถกรองตามเงื่อนไขต่างๆ ได้)
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
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *   post:
 *     tags:
 *       - 📚 Courses
 *     summary: สร้างรายวิชาใหม่
 *     description: ใช้สำหรับเพิ่มรายวิชาใหม่เข้าสู่ระบบ (เฉพาะผู้ดูแลระบบ)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - name
 *               - credit
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: "TST001"
 *                 description: รหัสวิชา
 *               name:
 *                 type: string
 *                 example: "ชื่อวิชาสำหรับเทส swagger"
 *                 description: ชื่อวิชา
 *               description:
 *                 type: string
 *                 example: "รายละเอียดรายวิชาสำหรับเทส swagger"
 *                 description: รายละเอียดรายวิชา
 *               credit:
 *                 type: object
 *                 required:
 *                   - theory
 *                   - practice
 *                   - self_study
 *                   - total
 *                 properties:
 *                   theory:
 *                     type: number
 *                     example: 2
 *                     description: ชั่วโมงทฤษฎี
 *                   practice:
 *                     type: number
 *                     example: 2
 *                     description: ชั่วโมงปฏิบัติ
 *                   self_study:
 *                     type: number
 *                     example: 3
 *                     description: ชั่วโมงศึกษาเอง
 *                   total:
 *                     type: number
 *                     example: 3
 *                     description: หน่วยกิตรวม
 *               faculty:
 *                 type: string
 *                 example: "เทคโนโลยีสารสนเทศ"
 *                 description: คณะ
 *               major:
 *                 type: string
 *                 example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *                 description: สาขา
 *               year:
 *                 type: number
 *                 example: 1
 *                 description: ปีที่เปิดสอน
 *               year_required:
 *                 type: number
 *                 example: 1
 *                 description: ปีที่นักศึกษาควรเรียนรายวิชานี้
 *               semester:
 *                 type: number
 *                 example: 1
 *                 description: เทอมที่เปิดสอน
 *               semester_required:
 *                 type: number
 *                 example: 1
 *                 description: เทอมที่นักศึกษาควรเรียนรายวิชานี้
 *     responses:
 *       201:
 *         description: สร้างวิชาสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/", authorize("admin"), createCourse);
router.get("/", getCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - 📚 Courses
 *     summary: ดูรายละเอียดวิชา
 *     description: ดึงข้อมูลรายวิชาตาม ID พร้อม sections ทั้งหมด
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "68e29843a4be9e5a4eadcb8d"
 *         description: Course ID
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: ไม่พบรายวิชา
 */
router.get("/:id", getCourseById);

/**
 * @swagger
 * /api/courses/{courseId}/sections:
 *   get:
 *     tags:
 *       - 📚 Courses
 *     summary: ดู Section ทั้งหมดของวิชา
 *     description: ดึงข้อมูล Section ทั้งหมดในวิชานั้นๆ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "68e29843a4be9e5a4eadcb8d"
 *         description: รหัสวิชา
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Section'
 *       404:
 *         description: ไม่พบรายวิชา
 *   post:
 *     tags:
 *       - 📚 Courses
 *     summary: เพิ่ม Section ใหม่
 *     description: เพิ่ม Section ใหม่ให้กับรายวิชาที่ระบุ (teacher และ admin สามารถทำได้)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           example: "68e29843a4be9e5a4eadcb8d"
 *         description: ObjectId ของรายวิชา
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section_number
 *               - type
 *               - teacher_id
 *               - schedule
 *               - original_max_students
 *               - max_students
 *             properties:
 *               section_number:
 *                 type: string
 *                 example: "L099"
 *                 description: ชื่อหรือหมายเลขของ Section
 *               type:
 *                 type: string
 *                 enum: [lecture, lab]
 *                 example: "lab"
 *                 description: ประเภทของ Section (lecture หรือ lab)
 *               teacher_id:
 *                 type: string
 *                 example: "68e379a60aa75aaeddc74ebc"
 *                 description: ObjectId ของอาจารย์ผู้สอน
 *               schedule:
 *                 type: array
 *                 description: ตารางเรียนของ Section
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: "Monday"
 *                       description: วันที่เรียน
 *                     time:
 *                       type: string
 *                       example: "09:00 - 12:30"
 *                       description: เวลาเรียน
 *                     location:
 *                       type: string
 *                       example: "05-0603"
 *                       description: ห้องเรียน
 *               original_max_students:
 *                 type: number
 *                 example: 80
 *                 description: จำนวนที่เปิดรับทั้งหมดใน Section นั้น
 *               max_students:
 *                 type: number
 *                 example: 80
 *                 description: จำนวนที่เหลือให้ลงทะเบียนได้
 *               enrolled_count:
 *                 type: number
 *                 example: 0
 *                 description: จำนวนนักศึกษาที่ลงทะเบียนแล้ว
 *     responses:
 *       201:
 *         description: เพิ่ม Section สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบรายวิชา
 */
router.post("/:courseId/sections", authorize("teacher", "admin"), addSection);
router.get("/:courseId/sections", getSections);

export default router;
