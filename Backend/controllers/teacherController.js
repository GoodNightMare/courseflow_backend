import { User } from "../models/Users.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
// ดู profile ของตัวเอง
export const getProfile = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู student ที่ตัวเองเป็น advisor
export const getStudents = async (req, res) => {
  try {
    // หา student ที่ teacher_id = id ของ teacher ปัจจุบัน และ role = "student"
    const students = await User.find({ teacher_id: req.user._id, role: "student" })
                               .select("-password")
                               .populate("teacher_id", "name email"); // ดึงข้อมูล teacher

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู course ที่ตัวเองสอน
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ "sections.teacher_id": req.user._id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSections = async (req, res) => {
  try {
    // ✅ เพิ่ม course_id ใน projection
    const courses = await Course.find(
      { "sections.teacher_id": req.user._id },
      { course_id: 1, name: 1, sections: 1 ,year: 1, semester: 1, faculty: 1, major: 1}
    );

    console.log(courses);



    // filter section ของ teacher คนนี้
    const sections = courses.map((course) => ({
      course_id: course.course_id, // ✅ ตอนนี้ใช้ course_id จริง ๆ แล้ว
      courseObjId: course._id,
      course_name: course.name,
      year: course.year,
      semester: course.semester,
      faculty: course.faculty,
      major: course.major,

      sections: course.sections.filter(
        (sec) => sec.teacher_id.toString() === req.user._id.toString()
      ),
    }));

    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดู student ในแต่ละ section
export const getStudentsInSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    // หา Enrollment ที่ลงทะเบียนใน section นี้
    const enrollments = await Enrollment.find({
      "courses.course_id": courseId,
      "courses.sections.section_id": sectionId
    }).populate("student_id", "student_id name email faculty major"); 

    if (enrollments.length === 0) {
      return res.status(404).json({ message: "No students found in this section" });
    }

    // สร้าง array ของข้อมูลนักเรียน
    const students = enrollments.map(enroll => ({
      studentId: enroll.student_id.student_id,
      name: enroll.student_id.name,
      email: enroll.student_id.email,
      faculty: enroll.student_id.faculty,
      major: enroll.student_id.major,
      createdAt: enroll.createdAt
    }));

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



