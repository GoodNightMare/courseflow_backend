import Course from "../models/Course.js";

// ➕ Create new course
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ message: "Course created successfully", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "sections.teacher_id",
      "name email"
    );
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔍 Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "sections.teacher_id",
      "name email"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated successfully", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➕ Add section to a course
export const addSection = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const { section_number, schedule } = req.body;

    // 1️⃣ ตรวจสอบ section_number ซ้ำ
    const exists = course.sections.some(
      (s) => s.section_number === section_number
    );
    if (exists) {
      return res.status(400).json({
        message: `Section number "${section_number}" already exists in this course`,
      });
    }

    // ✅ เพิ่ม section ใหม่
    course.sections.push(req.body);
    await course.save();

    res.status(201).json({ message: "Section added successfully", course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get all sections of a course
export const getSections = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate(
      "sections.teacher_id",
      "name email"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course.sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveSection = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { status } = req.body; // approved หรือ rejected

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const section = course.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.status = status;
    await course.save();

    res.json({ message: "Section status updated", section });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------
