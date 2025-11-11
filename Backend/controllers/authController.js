import { User, Student, Teacher, Admin } from "../models/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { ERROR_CODES, createErrorResponse, createSuccessResponse } from "../utils/errorCodes.js";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Register
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(createErrorResponse("SYS_VALIDATION_ERROR", { errors: errors.array() }));
  }

  const { name, email, password, role, student_id, teacher_id, faculty, major, year, yearLevel, semester } = req.body;

  try {
    // ตรวจสอบ email ซ้ำใน collection users
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json(createErrorResponse("AUTH_EMAIL_EXISTS"));
    }

    let user;

    if (role === "student") {
      user = await Student.create({ name, email, password, student_id, faculty, major, year, teacher_id, yearLevel, semester });
    } else if (role === "teacher") {
      user = await Teacher.create({ name, email, password, teacher_id, faculty, major });
    } else if (role === "admin") {
      user = await Admin.create({ name, email, password });
    } else {
      return res.status(400).json(createErrorResponse("AUTH_INVALID_ROLE"));
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json(createSuccessResponse({
      token,
      user,
    }, "ลงทะเบียนสำเร็จ"));
  } catch (err) {
    console.error("❌ [Register Error]:", err);
    res.status(500).json(createErrorResponse("SYS_DATABASE_ERROR", { detail: err.message }));
  }
};

// login
export const login = async (req, res) => {
  const { identifier, email, password } = req.body; // รองรับทั้ง identifier และ email

  // ✅ Log สำหรับ Debug
  console.log("📝 [Login Request]", {
    headers: req.headers["content-type"],
    body: req.body,
    hasEmail: !!email,
    hasIdentifier: !!identifier,
    hasPassword: !!password,
  });

  try {
    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!password) {
      return res.status(400).json(createErrorResponse("VAL_MISSING_FIELDS", {
        detail: "กรุณาระบุรหัสผ่าน"
      }));
    }

    if (!email && !identifier) {
      return res.status(400).json(createErrorResponse("VAL_MISSING_FIELDS", {
        detail: "กรุณาระบุ Email หรือ Identifier"
      }));
    }

    // ถ้าส่ง email มาให้ใช้ email, ไม่งั้นใช้ identifier
    const loginValue = email || identifier;

    const user = await User.findOne({
      $or: [
        { email: loginValue },
        { student_id: loginValue },
        { teacher_id: loginValue },
      ],
    }).populate('teacher_id', 'name email teacher_id');

    if (!user) {
      return res.status(404).json(createErrorResponse("AUTH_USER_NOT_FOUND"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(createErrorResponse("AUTH_INVALID_CREDENTIALS"));
    }

    const token = generateToken(user._id, user.role);
    
    res.json(createSuccessResponse({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
        major: user.major,
        year: user.year,
        yearLevel: user.yearLevel,
        semester: user.semester,
        student_id: user.student_id,
        teacher_id: user.teacher_id,
      }
    }, "Login สำเร็จ"));
  } catch (err) {
    console.error("❌ [Login Error]:", err);
    res.status(500).json(createErrorResponse("SYS_DATABASE_ERROR", { detail: err.message }));
  }
};

