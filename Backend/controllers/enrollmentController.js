// Backend/controllers/enrollmentController.js
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import {User} from "../models/Users.js";
import { updateStudentFromEnrollment } from "./academicYearController.js";

// ✅ 1. ฟังก์ชันถอนการลงทะเบียน (Unenroll)
export const unenrollSection = async (req, res) => {
  const { student_id, course_id, section_id } = req.body;

  try {
    const enrollment = await Enrollment.findOne({ student_id });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const courseIndex = enrollment.courses.findIndex(
      (c) => c.course_id.toString() === course_id
    );

    if (courseIndex === -1) {
      return res
        .status(404)
        .json({ message: "Course not found in enrollment" });
    }

    const course = enrollment.courses[courseIndex];
    const sectionIndex = course.sections.findIndex(
      (s) => s.section_id.toString() === section_id
    );

    if (sectionIndex === -1) {
      return res
        .status(404)
        .json({ message: "Section not found in enrollment" });
    }

    course.sections.splice(sectionIndex, 1);

    if (course.sections.length === 0) {
      enrollment.courses.splice(courseIndex, 1);
    }

    const courseDoc = await Course.findById(course_id);
    const section = courseDoc.sections.id(section_id);

    if (section) {
      section.max_students += 1;
      section.enrolled_count = Math.max(0, (section.enrolled_count || 0) - 1);
      await courseDoc.save();
    }

    await enrollment.save();

    res.json({
      message: "Unenrolled successfully",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 2. ฟังก์ชัน Helper: นับจำนวนนักเรียนจริงที่ลงทะเบียน
export const countEnrolledStudents = async (course_id, section_id) => {
  const count = await Enrollment.countDocuments({
    "courses.course_id": course_id,
    "courses.sections.section_id": section_id,
  });
  return count;
};

// ✅ 3. ฟังก์ชันซิงค์ที่นั่ง (Sync Seats) - ใช้เมื่อข้อมูลไม่ตรง
export const syncSectionSeats = async (req, res) => {
  const { course_id, section_id } = req.params;

  try {
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const section = course.sections.id(section_id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const enrolledCount = await countEnrolledStudents(course_id, section_id);
    const originalMaxStudents = section.original_max_students || 50;

    section.enrolled_count = enrolledCount;
    section.max_students = originalMaxStudents - enrolledCount;

    await course.save();

    res.json({
      message: "Seats synced successfully",
      enrolled: enrolledCount,
      available: section.max_students,
      original: originalMaxStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 4. แก้ไข enrollSection ให้มีการตรวจสอบที่นั่งแบบ real-time
export const enrollSection = async (req, res) => {
  const { student_id, courses, year, semester } = req.body; // ✅ เพิ่ม year, semester

  try {
    let enrollment = await Enrollment.findOne({ student_id });
    if (!enrollment) {
      enrollment = new Enrollment({ student_id, courses: [] });
    }

    for (const courseData of courses) {
      const { course_id, sections } = courseData; // ดึง sections แทน section_id

      const course = await Course.findById(course_id);
      if (!course) {
        return res
          .status(404)
          .json({ message: `Course ${course_id} not found` });
      }

      for (const sectionData of sections) {
        const sectionId = sectionData.section_id; // ดึงจาก sectionData
        const section = course.sections.id(sectionId);

        if (!section) {
          return res
            .status(404)
            .json({ message: `Section ${sectionId} not found` });
        }

        const enrolledCount = await countEnrolledStudents(course_id, sectionId);
        const originalMaxStudents = section.original_max_students || 50;
        const actualAvailableSeats = originalMaxStudents - enrolledCount;

        if (actualAvailableSeats <= 0) {
          return res.status(400).json({
            message: `Section ${sectionId} is full (${enrolledCount}/${originalMaxStudents})`,
          });
        }

        if (section.status && section.status !== "approved") {
          return res.status(400).json({
            message: `Section ${sectionId} not approved`,
          });
        }

        const existingCourse = enrollment.courses.find(
          (c) => c.course_id.toString() === course_id
        );

        if (existingCourse) {
          const alreadyEnrolled = existingCourse.sections.some(
            (s) => s.section_id.toString() === sectionId
          );

          if (alreadyEnrolled) {
            return res.status(400).json({
              message: `Already enrolled in section ${sectionId}`,
            });
          }

          existingCourse.sections.push({
            section_id: sectionId,
            status: sectionData.status || "enrolled",
          });
        } else {
          enrollment.courses.push({
            course_id,
            sections: [
              {
                section_id: sectionId,
                status: sectionData.status || "enrolled",
              },
            ],
          });
        }

        section.max_students -= 1;
        section.enrolled_count = (section.enrolled_count || 0) + 1;
        await course.save();
      }
    }

    await enrollment.save();

    // ✅ อัพเดทปีการศึกษา/เทอมของนักศึกษาอัตโนมัติหลังลงทะเบียนสำเร็จ
    if (year && semester) {
      await updateStudentFromEnrollment(student_id, { year, semester });
      console.log(`✅ [Enrollment] Updated student ${student_id} -> ${year}/${semester}`);
    }

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 5. ฟังก์ชันเช็คที่นั่งว่างก่อนลงทะเบียน
export const checkSectionAvailability = async (req, res) => {
  const { course_id, section_id } = req.params;

  try {
    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const section = course.sections.id(section_id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const enrolledCount = await countEnrolledStudents(course_id, section_id);
    const originalMaxStudents = section.original_max_students || 50;

    res.json({
      section_number: section.section_number,
      max_students: originalMaxStudents,
      enrolled: enrolledCount,
      available: originalMaxStudents - enrolledCount,
      is_full: enrolledCount >= originalMaxStudents,
      status: section.status,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 6. ดูรายวิชาที่นักเรียนลงทะเบียนแล้ว
export const getMyEnrollments = async (req, res) => {
  try {
    const { student_id } = req.params;

    const enrollment = await Enrollment.findOne({ student_id });

    if (!enrollment || enrollment.courses.length === 0) {
      return res.json({
        message: "No enrollments found",
        student_id,
        total_courses: 0,
        total_credits: 0,
        courses: [],
      });
    }

    const enrolledCourses = await Promise.all(
      enrollment.courses.map(async (enrollCourse) => {
        const course = await Course.findById(enrollCourse.course_id).populate(
          "sections.teacher_id",
          "name email"
        );

        if (!course) return null;

        const sectionsDetail = enrollCourse.sections
          .map((enrollSection) => {
            const section = course.sections.id(enrollSection.section_id);

            if (!section) return null;

            return {
              section_id: section._id,
              section_number: section.section_number,
              type: section.type,
              teacher: section.teacher_id,
              schedule: section.schedule,
              enrollment_status: enrollSection.status,
              max_students:
                section.original_max_students || section.max_students,
              enrolled_count: section.enrolled_count || 0,
              available_seats: Math.max(
                0,
                (section.original_max_students || section.max_students) -
                  (section.enrolled_count || 0)
              ),
            };
          })
          .filter(Boolean);

        return {
          course_id: course._id,
          course_code: course.course_id,
          name: course.name,
          credit: course.credit,
          sections: sectionsDetail,
          year: course.year,
          semester: course.semester,
        };
      })
    );

    const validCourses = enrolledCourses.filter(Boolean);

    const totalCredits = validCourses.reduce((sum, course) => {
      return sum + (course.credit.total || 0);
    }, 0);

    res.json({
      student_id,
      total_courses: validCourses.length,
      total_credits: totalCredits,
      courses: validCourses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 9. ซิงค์ที่นั่งทั้งหมด (Sync All Seats)
export const syncAllSectionSeats = async (req, res) => {
  try {
    const courses = await Course.find({});
    let syncedCount = 0;
    let errors = [];

    for (const course of courses) {
      for (const section of course.sections) {
        try {
          const enrolledCount = await countEnrolledStudents(
            course._id,
            section._id
          );
          const originalMax = section.original_max_students || 50;

          section.enrolled_count = enrolledCount;
          section.max_students = originalMax - enrolledCount;
          syncedCount++;
        } catch (err) {
          errors.push({
            course_id: course._id,
            section_id: section._id,
            error: err.message,
          });
        }
      }
      await course.save();
    }

    res.json({
      message: "All seats synced successfully",
      synced_sections: syncedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ 10. สถิติการลงทะเบียน
export const getEnrollmentStats = async (req, res) => {
  try {
    const { course_id } = req.params;

    const course = await Course.findById(course_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const sectionStats = await Promise.all(
      course.sections.map(async (section) => {
        const enrolledCount = await countEnrolledStudents(
          course_id,
          section._id
        );
        const originalMax =
          section.original_max_students || section.max_students;
        const available = originalMax - enrolledCount;
        const percentFull =
          originalMax > 0
            ? ((enrolledCount / originalMax) * 100).toFixed(2)
            : 0;

        return {
          section_id: section._id,
          section_number: section.section_number,
          type: section.type,
          status: section.status,
          max_students: originalMax,
          enrolled: enrolledCount,
          available: Math.max(0, available),
          percent_full: percentFull,
          is_full: available <= 0,
        };
      })
    );

    const totalMax = sectionStats.reduce((sum, s) => sum + s.max_students, 0);
    const totalEnrolled = sectionStats.reduce((sum, s) => sum + s.enrolled, 0);

    res.json({
      course_id: course._id,
      course_code: course.course_id,
      name: course.name,
      total_sections: course.sections.length,
      total_capacity: totalMax,
      total_enrolled: totalEnrolled,
      total_available: Math.max(0, totalMax - totalEnrolled),
      percent_full:
        totalMax > 0 ? ((totalEnrolled / totalMax) * 100).toFixed(2) : 0,
      sections: sectionStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate({
        path: "student_id", // student_id เป็น ObjectId ของ User
        select: "name student_id yearLevel semester faculty major",
        model: User,
      })
      .populate({
        path: "courses.course_id",
        select: "course_id name faculty major year semester sections",
      })
      .lean();

    // แปลงข้อมูลให้ client ใช้ง่าย
    const data = enrollments.map((e) => {
      // กรองเอาเฉพาะ courses ที่มี sections
      const validCourses = e.courses
        .map((c) => {
          if (!c.course_id || !c.sections?.length) return null;

          const mappedSections = c.sections.map((s) => {
            const sectionObj = c.course_id.sections.find(
              (sec) => String(sec._id) === String(s.section_id)
            );
            return sectionObj
              ? {
                  section_number: sectionObj.section_number,
                  grade: s.grade,
                  status: s.status,
                }
              : null;
          }).filter(Boolean);

          if (!mappedSections.length) return null;

          return {
            course_id: c.course_id.course_id,
            course_name: c.course_id.name,
            sections: mappedSections,
          };
        })
        .filter(Boolean);

      if (!validCourses.length) return null;

      return {
        _id: e._id,
        student_id: e.student_id?._id,
        student_name: e.student_id?.name,
        student_code: e.student_id?.student_id,
        yearLevel: e.student_id?.yearLevel,
        semester: e.student_id?.semester,
        faculty: e.student_id?.faculty,
        major: e.student_id?.major,
        courses: validCourses,
      };
    }).filter(Boolean); // ลบ enrollments ที่ไม่มีวิชา

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { faculty: filterFaculty, yearLevel: filterYearLevel, major: filterMajor } = req.query;

    // ดึงนักศึกษาทั้งหมด พร้อมข้อมูลที่ต้องการ
    const allStudents = await User.find({ role: "student" }).select("faculty major yearLevel _id");

    // สร้าง filter object
    const studentFilter = { role: "student" };
    if (filterFaculty && filterFaculty !== "ทั้งหมด") {
      studentFilter.faculty = filterFaculty;
    }
    if (filterYearLevel && filterYearLevel !== "ทั้งหมด") {
      studentFilter.yearLevel = parseInt(filterYearLevel);
    }
    if (filterMajor && filterMajor !== "ทั้งหมด") {
      studentFilter.major = filterMajor;
    }

    // ดึงนักศึกษาที่ filter แล้ว
    const filteredStudents = await User.find(studentFilter).select("faculty major yearLevel _id");

    // ดึง enrollments
    const enrollments = await Enrollment.find().lean();

    // สร้าง map ของ faculty stats
    const facultyStats = {};

    // นับนักศึกษาที่ filter แล้วตาม faculty
    filteredStudents.forEach((student) => {
      const faculty = student.faculty || "ไม่ระบุ";
      if (!facultyStats[faculty]) {
        facultyStats[faculty] = {
          faculty: faculty,
          totalStudents: 0,
          enrolledStudents: 0,
          unenrolledStudents: 0,
        };
      }
      facultyStats[faculty].totalStudents++;
    });

    // สร้าง set ของ student IDs ที่ลงทะเบียนแล้ว
    const enrolledStudentIds = new Set(
      enrollments.map((e) => e.student_id.toString())
    );

    // นับนักศึกษาที่ลงทะเบียนแล้วตาม faculty (จาก filtered students)
    filteredStudents.forEach((student) => {
      if (enrolledStudentIds.has(student._id.toString())) {
        const faculty = student.faculty || "ไม่ระบุ";
        if (facultyStats[faculty]) {
          facultyStats[faculty].enrolledStudents++;
        }
      }
    });

    // คำนวณ unenrolled students
    Object.keys(facultyStats).forEach((faculty) => {
      facultyStats[faculty].unenrolledStudents =
        facultyStats[faculty].totalStudents - facultyStats[faculty].enrolledStudents;
    });

    // แปลงเป็น array
    const stats = Object.values(facultyStats);

    // คำนวณรวมทั้งหมด
    const totalStats = {
      totalStudents: stats.reduce((sum, f) => sum + f.totalStudents, 0),
      enrolledStudents: stats.reduce((sum, f) => sum + f.enrolledStudents, 0),
      unenrolledStudents: stats.reduce((sum, f) => sum + f.unenrolledStudents, 0),
    };

    // สร้าง options สำหรับ filter dropdowns
    const faculties = [...new Set(allStudents.map(s => s.faculty).filter(f => f))].sort();
    const yearLevels = [...new Set(allStudents.map(s => s.yearLevel).filter(y => y))].sort((a, b) => a - b);
    
    // Filter majors based on selected faculty
    let availableMajors;
    if (filterFaculty && filterFaculty !== "ทั้งหมด") {
      // เฉพาะสาขาในคณะที่เลือก
      availableMajors = [...new Set(
        allStudents
          .filter(s => s.faculty === filterFaculty)
          .map(s => s.major)
          .filter(m => m)
      )].sort();
    } else {
      // สาขาทั้งหมด
      availableMajors = [...new Set(allStudents.map(s => s.major).filter(m => m))].sort();
    }

    res.json({
      total: totalStats,
      byFaculty: stats,
      options: {
        faculties,
        yearLevels,
        majors: availableMajors,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

