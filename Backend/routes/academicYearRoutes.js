import express from "express";
import {
  createAcademicYear,
  getAllAcademicYears,
  getAcademicYearByYear,
  updateSemester,
  getCurrentSemester,
  bulkUpdateStudentSemester,
  promoteStudents,
  previewPromotion,
} from "../controllers/academicYearController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);
/**
 * @swagger
 * /api/academic-years:
 *   get:
 *     tags:
 *       - 📅 Academic Years
 *     summary: ดูปีการศึกษาทั้งหมด
 *     description: ดึงข้อมูลปีการศึกษาทั้งหมด (Public - ไม่ต้อง login)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcademicYear'
 *   post:
 *     tags:
 *       - 📅 Academic Years
 *     summary: สร้างปีการศึกษาใหม่
 *     description: สร้างปีการศึกษาใหม่พร้อมภาคเรียน (เฉพาะ admin)
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
 *               - semesters
 *             properties:
 *               year:
 *                 type: string
 *                 example: "2567"
 *               semesters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     semesterNumber:
 *                       type: number
 *                       example: 1
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-06-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-10-31"
 *     responses:
 *       201:
 *         description: สร้างปีการศึกษาสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.get("/", getAllAcademicYears); //✅ 
router.post("/", authorize("admin"), createAcademicYear); //✅ 

/**
 * @swagger
 * /api/academic-years/current/now:
 *   get:
 *     tags:
 *       - 📅 Academic Years
 *     summary: ดูภาคเรียนปัจจุบัน
 *     description: ดึงข้อมูลภาคเรียนที่กำลังเปิดอยู่ในขณะนี้ (Public)
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 year:
 *                   type: string
 *                 semesterNumber:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isCurrent:
 *                   type: boolean
 *       404:
 *         description: ไม่พบภาคเรียนปัจจุบัน
 */
router.get("/current/now", getCurrentSemester); //✅ 

// /**
//  * @swagger
//  * /api/academic-years/{year}:
//  *   get:
//  *     tags:
//  *       - 📅 Academic Years
//  *     summary: ดูข้อมูลปีการศึกษา
//  *     description: ดึงข้อมูลปีการศึกษาตามปีที่ระบุ (Public)
//  *     parameters:
//  *       - in: path
//  *         name: year
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ปีการศึกษา เช่น 2567
//  *     responses:
//  *       200:
//  *         description: ดึงข้อมูลสำเร็จ
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/AcademicYear'
//  *       404:
//  *         description: ไม่พบปีการศึกษา
//  */
// router.get("/:year", getAcademicYearByYear);

// /**
//  * @swagger
//  * /api/academic-years/{year}/semester/{semesterNumber}:
//  *   patch:
//  *     tags:
//  *       - 📅 Academic Years
//  *     summary: อัพเดทภาคเรียน
//  *     description: แก้ไขข้อมูลภาคเรียน (เฉพาะ admin)
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: year
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ปีการศึกษา
//  *       - in: path
//  *         name: semesterNumber
//  *         required: true
//  *         schema:
//  *           type: number
//  *         description: ภาคเรียนที่
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *               isCurrent:
//  *                 type: boolean
//  *     responses:
//  *       200:
//  *         description: อัพเดทสำเร็จ
//  *       401:
//  *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
//  *       404:
//  *         description: ไม่พบภาคเรียน
//  */
// router.patch("/:year/semester/:semesterNumber", protect, authorize("admin"), updateSemester);

/**
 * @swagger
 * /api/academic-years/students/bulk-update:
 *   post:
 *     tags:
 *       - 📅 Academic Years
 *     summary: อัพเดทภาคเรียนของนักศึกษาแบบกลุ่ม
 *     description: อัพเดทภาคเรียนของนักศึกษาหลายคนตามเงื่อนไขที่กำหนด (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetYear
 *               - targetSemester
 *             properties:
 *               targetYear:
 *                 type: string
 *                 description: ปีการศึกษาที่ต้องการอัพเดท
 *                 example: "2567"
 *               targetSemester:
 *                 type: number
 *                 description: ภาคเรียนที่ต้องการอัพเดท
 *                 example: 1
 *               filter:
 *                 type: object
 *                 description: เงื่อนไขการกรองนักศึกษา
 *                 properties:
 *                   faculty:
 *                     type: string
 *                     example: "เทคโนโลยีสารสนเทศ"
 *     responses:
 *       200:
 *         description: อัพเดทสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/students/bulk-update", authorize("admin"), bulkUpdateStudentSemester); //✅ 

// /**
//  * @swagger
//  * /api/academic-years/students/promotion-preview:
//  *   get:
//  *     tags:
//  *       - 📅 Academic Years
//  *     summary: ดูตัวอย่างการขึ้นชั้นปี
//  *     description: แสดงตัวอย่างนักเรียนที่จะขึ้นชั้นปี (เฉพาะ admin)
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: ดึงข้อมูลสำเร็จ
//  *       401:
//  *         description: ไม่มีสิทธิ์เข้าถึง
//  */
// router.get("/students/promotion-preview", protect, authorize("admin"), previewPromotion);

/**
 * @swagger
 * /api/academic-years/students/promote:
 *   post:
 *     tags:
 *       - 📅 Academic Years
 *     summary: ขึ้นชั้นปีให้นักศึกษา
 *     description: ทำการเลื่อนชั้นปีให้นักศึกษาทั้งหมดตามปีการศึกษาและภาคเรียนที่ระบุ (เฉพาะ admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromYear
 *               - fromYearLevel
 *               - fromSemester
 *             properties:
 *               fromYear:
 *                 type: string
 *                 description: ปีการศึกษาปัจจุบันของนักศึกษาที่ต้องการเลื่อนชั้น
 *                 example: "2567"
 *               fromYearLevel:
 *                 type: number
 *                 description: ชั้นปีปัจจุบัน
 *                 example: 2
 *               fromSemester:
 *                 type: number
 *                 description: ภาคเรียนปัจจุบัน
 *                 example: 2
 *     responses:
 *       200:
 *         description: ขึ้นชั้นปีสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/students/promote", authorize("admin"), promoteStudents);//✅ 

export default router;
