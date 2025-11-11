// -- GET /api/students/me ---- ดู profile ของตัวเอง
// PUT /api/students/me ---- แก้ไข profile ของตัวเอง
// -- GET /api/students/me/courses ---- ดู courses ที่ตัวเองลงทะเบียนแล้ว
// POST /api/students/me/register-course ---- ลงทะเบียนเรียน course
// DELETE /api/students/me/drop-course ---- ถอนวิชาที่ลงทะเบียน


import { User } from "../models/Users.js";
import  Enrollment  from "../models/Enrollment.js";
// import Course from "../models/Course.js";

// 📌 1. ดูโปรไฟล์นักเรียน (profile)
export const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 2. ดูรายวิชาที่ตัวเองลงทะเบียน
export const getMyEnrollments = async (req, res) => {
  try {
    console.log(req.user._id);
    const enrollments = await Enrollment.find({ student_id: req.user._id })
      .populate("courses.course_id", "course_id name credit year_required semester_required")
      .populate("student_id", "name email"); // optional

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 3. ดูอาจารย์ที่ปรึกษา (advisor)
export const getAdvisor = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate("teacher_id", "name email department");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.teacher_id) {
      return res.status(404).json({ message: "Teacher not assigned" });
    }

    res.json(student.teacher_id);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




