import Curriculum from "../models/Curriculum.js";

export const createCurriculum = async (req, res) => {
  try {
    const { faculty, major, plan } = req.body;

    // ตรวจสอบว่ามี Curriculum ของคณะ/สาขานี้อยู่แล้วหรือไม่
    let curriculum = await Curriculum.findOne({ faculty, major });

    if (curriculum) {
      // ถ้ามีอยู่แล้ว → รวมข้อมูล plan เดิมกับ plan ใหม่
      plan.forEach(newYearSemester => {
        // หาปี/เทอมเดียวกัน
        let existingYearSemester = curriculum.plan.find(
          ys =>
            ys.year === newYearSemester.year &&
            ys.semester === newYearSemester.semester
        );

        if (existingYearSemester) {
          // ถ้ามีเทอมนี้อยู่แล้ว → เพิ่มรายวิชาใหม่เข้าไป
          newYearSemester.courses.forEach(newCourse => {
            // ตรวจสอบว่ามีวิชานี้อยู่แล้วหรือยัง (กันซ้ำ)
            const isDuplicate = existingYearSemester.courses.some(
              c => c.course_id === newCourse.course_id
            );
            if (!isDuplicate) {
              existingYearSemester.courses.push(newCourse);
            }
          });
        } else {
          // ถ้ายังไม่มีเทอมนี้ → เพิ่มเทอมใหม่ลงใน plan
          curriculum.plan.push(newYearSemester);
        }
      });

      // save (pre-save จะคำนวณหน่วยกิตให้อัตโนมัติ)
      await curriculum.save();
    } else {
      // ถ้ายังไม่มี → สร้างใหม่เลย
      curriculum = new Curriculum({ faculty, major, plan });
      await curriculum.save();
    }

    res.status(201).json(curriculum);
  } catch (err) {
    console.error("Error in createCurriculum:", err);
    res.status(400).json({ message: err.message });
  }
};


export const getCurriculums = async (req, res) => {
  try {
    const curriculums = await Curriculum.find().populate("plan.courses"); // populate courses

    // คำนวณ totalCredits
    curriculums.forEach(curriculum => {
      curriculum.plan.forEach(yearSemester => {
        let semesterTotal = 0;
        yearSemester.courses.forEach(course => {
          semesterTotal += course.credit.total;
        });
        yearSemester.totalCredits = semesterTotal;
      });
      curriculum.totalCredits = curriculum.plan.reduce((sum, ys) => sum + ys.totalCredits, 0);
    });

    res.json(curriculums);
  } catch (err) {
    console.error("Error in getCurriculums:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCurriculumByFacultyAndMajor = async (req, res) => {
  try {
    const { faculty, major } = req.params;

    const curriculum = await Curriculum.findOne({ faculty, major }).populate("plan.courses"); // populate courses

    if (!curriculum) {
      return res.status(404).json({ message: "Curriculum not found" });
    }

    // คำนวณ totalCredits
    curriculum.plan.forEach(yearSemester => {
      let semesterTotal = 0;
      yearSemester.courses.forEach(course => {
        semesterTotal += course.credit.total;
      });
      yearSemester.totalCredits = semesterTotal;
    });
    curriculum.totalCredits = curriculum.plan.reduce((sum, ys) => sum + ys.totalCredits, 0);

    res.json(curriculum);
  } catch (err) {
    console.error("Error in getCurriculumByFacultyAndMajor:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getCurriculumByFilter = async (req, res) => {
  try {
    const { faculty, major, year, semester } = req.params;

    // หา curriculum ตาม faculty + major
    const curriculum = await Curriculum.findOne({ faculty, major }).populate("plan.courses");

    if (!curriculum) {
      // ถ้าไม่เจอ curriculum ให้ส่ง courses เป็น array ว่าง
      return res.json({
        faculty,
        major,
        year: Number(year),
        semester: Number(semester),
        courses: [],
        totalCredits: 0,
      });
    }

    // filter plan ตาม year + semester
    const filteredPlan = curriculum.plan.filter(
      (p) => p.year === Number(year) && p.semester === Number(semester)
    );

    if (filteredPlan.length === 0) {
      // ถ้าไม่มีแผนการเรียนของเทอมนี้ ส่ง array ว่าง
      return res.json({
        faculty: curriculum.faculty,
        major: curriculum.major,
        year: Number(year),
        semester: Number(semester),
        courses: [],
        totalCredits: 0,
      });
    }

    // คำนวณ totalCredits ของ semester
    filteredPlan.forEach(ys => {
      let semesterTotal = 0;
      ys.courses.forEach(course => {
        semesterTotal += course.credit.total;
      });
      ys.totalCredits = semesterTotal;
    });

    res.json({
      faculty: curriculum.faculty,
      major: curriculum.major,
      year: Number(year),
      semester: Number(semester),
      courses: filteredPlan.flatMap(ys => ys.courses), // populated course object
      totalCredits: filteredPlan.reduce((sum, ys) => sum + ys.totalCredits, 0)
    });
  } catch (err) {
    console.error("Error in getCurriculumByFilter:", err);
    res.status(500).json({ message: err.message });
  }
};










// ✅ อัปเดต Curriculum
export const updateCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(curriculum);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ ลบ Curriculum
export const deleteCurriculum = async (req, res) => {
  try {
    await Curriculum.findByIdAndDelete(req.params.id);
    res.json({ message: "Curriculum deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
