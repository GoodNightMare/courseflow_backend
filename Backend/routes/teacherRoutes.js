import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  getProfile,
  getStudents,
  getCourses,
  getSections,
  getStudentsInSection
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("teacher"));

/**
 * @swagger
 * /api/teacher/students:
 *   get:
 *     tags:
 *       - 👨‍🏫 Teacher
 *     summary: ดูรายชื่อนักเรียนที่อาจารย์ดูแล
 *     description: ดึงข้อมูลนักเรียนที่อาจารย์เป็นที่ปรึกษา
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
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง (ต้องเป็น teacher)
 */
router.get("/students", getStudents);

/**
 * @swagger
 * /api/teacher/courses:
 *   get:
 *     tags:
 *       - 👨‍🏫 Teacher
 *     summary: ดูรายวิชาที่อาจารย์สอน
 *     description: ดึงข้อมูลรายวิชาทั้งหมดที่อาจารย์ท่านนี้สอน
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
 */
router.get("/courses", getCourses);

/**
 * @swagger
 * /api/teacher/sections:
 *   get:
 *     tags:
 *       - 👨‍🏫 Teacher
 *     summary: ดู Section ที่อาจารย์สอน
 *     description: ดึงข้อมูล Section ทั้งหมดที่อาจารย์ท่านนี้สอน
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
 *                   course:
 *                     $ref: '#/components/schemas/Course'
 *                   sections:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Section'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.get("/sections", getSections);

/**
 * @swagger
 * /api/teacher/courses/{courseId}/sections/{sectionId}/students:
 *   get:
 *     tags:
 *       - 👨‍🏫 Teacher
 *     summary: ดูนักเรียนใน Section
 *     description: ดึงรายชื่อนักเรียนที่ลงทะเบียนใน Section นั้นๆ
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
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *           example: "68e3862e0aa75aaeddc74f0b"
 *         description: รหัส Section
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
 *                   student:
 *                     $ref: '#/components/schemas/User'
 *                   enrolled_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       404:
 *         description: ไม่พบ Course หรือ Section
 */
router.get("/courses/:courseId/sections/:sectionId/students", getStudentsInSection);

export default router;
