import express from "express";
import { register, login } from "../controllers/authController.js";
import { body } from "express-validator";
import { authorize } from "../middlewares/roleMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: เข้าสู่ระบบ (Login)
 *     description: |
 *       ใช้สำหรับ Login เข้าสู่ระบบด้วย email และ password
 *       
 *       **วิธีใช้งาน:**
 *       1. กด "Try it out"
 *       2. กรอก email และ password
 *       3. กด "Execute"
 *       4. คัดลอก token จาก Response
 *       5. กดปุ่ม "Authorize" 🔓 ด้านบน
 *       6. วาง token ในช่อง Value (ไม่ต้องใส่ Bearer ข้างหน้า)
 *       7. กด "Authorize" แล้วกด "Close"
 *       8. ตอนนี้สามารถใช้งาน API อื่นๆ ได้แล้ว
 *       
 *       **บัญชีทดสอบ:**
 *       - Admin: admin@gmail.com / admin123
 *       - Teacher: teacherF@gmail.com / teacherF
 *       - Student: studentA@gmail.com / studentA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@gmail.com"
 *                 description: "Email ของผู้ใช้"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *                 description: "รหัสผ่าน"
 *           examples:
 *             admin:
 *               summary: Admin Account
 *               value:
 *                 email: "admin@gmail.com"
 *                 password: "admin123"
 *             teacher:
 *               summary: Teacher Account
 *               value:
 *                 email: "teacherF@gmail.com"
 *                 password: "teacherF"
 *             student:
 *               summary: Student Account
 *               value:
 *                 email: "studentA@gmail.com"
 *                 password: "studentA"
 *     responses:
 *       200:
 *         description: Login สำเร็จ - คัดลอก token ไปใช้กับปุ่ม Authorize
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "673a123456789abc"
 *                 name:
 *                   type: string
 *                   example: "Admin User"
 *                 email:
 *                   type: string
 *                   example: "admin@courseflow.com"
 *                 role:
 *                   type: string
 *                   enum: [student, teacher, admin]
 *                   example: "admin"
 *                 faculty:
 *                   type: string
 *                   example: "วิทยาศาสตร์"
 *                 major:
 *                   type: string
 *                   example: "วิทยาการคอมพิวเตอร์"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: "🔑 JWT Token - คัดลอกค่านี้ไปใส่ในปุ่ม Authorize"
 *       401:
 *         description: Email หรือ Password ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid email or password"
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: สร้างบัญชีผู้ใช้ใหม่ (Register)
 *     description: |
 *       ใช้สำหรับ **Admin** ในการสร้างบัญชีผู้ใช้ใหม่ (student, teacher, admin)
 *
 *       **เงื่อนไข:**
 *       - ต้อง Login และมี role = admin  
 *       - สามารถระบุ faculty / major / year / yearLevel / semester ได้ในกรณีเป็น student  
 *       - สำหรับ teacher สามารถระบุ teacher_id ของอาจารย์ที่ปรึกษาได้  
 *
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "สมชาย ใจดี"
 *                 description: ชื่อผู้ใช้
 *               email:
 *                 type: string
 *                 example: "somchai@example.com"
 *                 description: อีเมลของผู้ใช้
 *               password:
 *                 type: string
 *                 example: "123456"
 *                 description: รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
 *               role:
 *                 type: string
 *                 enum: [student, teacher, admin]
 *                 example: "student"
 *                 description: บทบาทของผู้ใช้
 *               faculty:
 *                 type: string
 *                 example: "เทคโนโลยีสารสนเทศ"
 *                 description: คณะ (เฉพาะ student)
 *               major:
 *                 type: string
 *                 example: "วิทยาการคอมพิวเตอร์และนวัตกรรมการพัฒนาซอฟต์แวร์"
 *                 description: สาขา (เฉพาะ student)
 *               year:
 *                 type: number
 *                 example: 2568
 *                 description: ปีการศึกษา (เฉพาะ student)
 *               yearLevel:
 *                 type: number
 *                 example: 3
 *                 description: ชั้นปี (เฉพาะ student)
 *               semester:
 *                 type: number
 *                 example: 1
 *                 description: ภาคเรียน (เฉพาะ student)
 *               student_id:
 *                 type: string
 *                 example: "68000001"
 *                 description: รหัสนักศึกษา 
 *               teacher_id:
 *                 type: string
 *                 example: "68e3797e0aa75aaeddc74eb8"
 *                 description: ObjectId ของอาจารย์ผู้สอน (เชื่อมกับ User collection)
 *     responses:
 *       201:
 *         description: ✅ สร้างบัญชีผู้ใช้สำเร็จ
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
 *                   example: "สร้างบัญชีผู้ใช้สำเร็จ"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ❌ ข้อมูลไม่ครบหรือไม่ถูกต้อง
 *       401:
 *         description: 🔒 ไม่มีสิทธิ์เข้าถึง (ต้อง login และเป็น admin)
 */
router.post(
  "/register",
  protect,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .isIn(["student", "teacher", "admin"])
      .withMessage("Invalid role"),
  ],
  register
);


export default router;
