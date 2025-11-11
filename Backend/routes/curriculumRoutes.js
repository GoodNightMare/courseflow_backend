import express from "express";
import {
  createCurriculum,
  getCurriculums,
  getCurriculumByFacultyAndMajor,
  updateCurriculum,
  deleteCurriculum,
  getCurriculumByFilter,
} from "../controllers/curriculumController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/curriculums:
 *   post:
 *     tags:
 *       - 📖 Curriculum
 *     summary: สร้างหลักสูตรใหม่
 *     description: สร้างหลักสูตรใหม่สำหรับคณะ/สาขา โดยกำหนดแผนการเรียนแยกตามปีและเทอม (เฉพาะ admin)
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
 *               - plan
 *             properties:
 *               faculty:
 *                 type: string
 *                 example: "เทคโนโลยีสารสนเทศ Test"
 *                 description: ชื่อคณะ
 *               major:
 *                 type: string
 *                 example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *                 description: ชื่อสาขาวิชา
 *               plan:
 *                 type: array
 *                 description: แผนการเรียนแยกตามปีและภาคเรียน
 *                 items:
 *                   type: object
 *                   required:
 *                     - year
 *                     - semester
 *                     - courses
 *                   properties:
 *                     year:
 *                       type: number
 *                       example: 1
 *                       description: ชั้นปี เช่น 1, 2, 3, 4
 *                     semester:
 *                       type: number
 *                       example: 1
 *                       description: เทอม เช่น 1 หรือ 2
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["68e295c3a4be9e5a4eadcb75", "68e29665a4be9e5a4eadcb78"]
 *                       description: รหัส ObjectId ของรายวิชาในเทอมนั้น
 *     responses:
 *       201:
 *         description: ✅ สร้างหลักสูตรสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "สร้างหลักสูตรสำเร็จ"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "674aef12345678abcd90ef12"
 *                     faculty:
 *                       type: string
 *                       example: "วิทยาศาสตร์"
 *                     major:
 *                       type: string
 *                       example: "วิทยาการคอมพิวเตอร์"
 *                     plan:
 *                       type: array
 *                       example:
 *                         - year: 1
 *                           semester: 1
 *                           courses: ["673a123456789abc", "673a987654321def"]
 *                         - year: 1
 *                           semester: 2
 *                           courses: ["673afff987654321def1234"]
 *       400:
 *         description: ❌ ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: 🔒 ไม่มีสิทธิ์เข้าถึง (ต้องเป็น admin)
 */
router.post("/", authorize("admin"), createCurriculum);

/**
 * @swagger
 * /api/curriculums/{faculty}/{major}:
 *   get:
 *     tags:
 *       - 📖 Curriculum
 *     summary: ดูหลักสูตรตามคณะและสาขา
 *     description: ดึงหลักสูตรทั้งหมดของคณะและสาขานั้นๆ
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curriculum'
 *       404:
 *         description: ไม่พบหลักสูตร
 */
router.get("/:faculty/:major", getCurriculumByFacultyAndMajor);

/**
 * @swagger
 * /api/curriculums/{faculty}/{major}/{year}/{semester}:
 *   get:
 *     tags:
 *       - 📖 Curriculum
 *     summary: ดูหลักสูตรตามตัวกรอง
 *     description: ดึงหลักสูตรตามคณะ/สาขา/ชั้นปี/ภาคเรียน
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
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: number
 *         example: 3
 *         description: ชั้นปี
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *         description: ภาคเรียน
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Curriculum'
 *       404:
 *         description: ไม่พบหลักสูตร
 */
router.get("/:faculty/:major/:year/:semester", getCurriculumByFilter);

export default router;
