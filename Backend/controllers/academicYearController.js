import AcademicYear from "../models/AcademicYear.js";
import { User } from "../models/Users.js";

// ➕ เพิ่มปีการศึกษาใหม่
export const createAcademicYear = async (req, res) => {
  try {
    const { year, semesters } = req.body;

    // ✅ Validation
    if (!year || !semesters || !Array.isArray(semesters)) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง" });
    }

    // ตรวจสอบว่าปีการศึกษานี้มีอยู่แล้วหรือไม่
    const existingYear = await AcademicYear.findOne({ year });
    if (existingYear) {
      return res.status(400).json({ message: "ปีการศึกษานี้มีอยู่ในระบบแล้ว" });
    }

    // ตรวจสอบวันที่ของแต่ละเทอม
    for (const sem of semesters) {
      if (new Date(sem.startDate) >= new Date(sem.endDate)) {
        return res.status(400).json({ 
          message: `วันเริ่มต้นต้องน้อยกว่าวันสิ้นสุดสำหรับเทอม ${sem.semesterNumber}` 
        });
      }
    }

    const newYear = new AcademicYear({ year, semesters });
    await newYear.save();
    res.status(201).json({ message: "เพิ่มปีการศึกษาเรียบร้อย", data: newYear });
  } catch (error) {
    console.error("Error creating academic year:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา" });
  }
};

// 📋 ดึงปีการศึกษาทั้งหมด
export const getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find();
    res.json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔍 ดึงปีการศึกษาตามปี
export const getAcademicYearByYear = async (req, res) => {
  try {
    const year = req.params.year;
    const data = await AcademicYear.findOne({ year });
    if (!data) return res.status(404).json({ message: "ไม่พบปีการศึกษา" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ อัปเดตข้อมูลเทอมในปีนั้น
export const updateSemester = async (req, res) => {
  try {
    const { year, semesterNumber } = req.params;
    const { startDate, endDate } = req.body;

    // ✅ Validation
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "วันเริ่มต้นต้องน้อยกว่าวันสิ้นสุด" });
    }

    const academicYear = await AcademicYear.findOne({ year });
    if (!academicYear) return res.status(404).json({ message: "ไม่พบปีการศึกษา" });

    const semester = academicYear.semesters.find(
      (s) => s.semesterNumber == semesterNumber
    );
    if (!semester) return res.status(404).json({ message: "ไม่พบเทอมนี้" });

    semester.startDate = startDate ? new Date(startDate) : semester.startDate;
    semester.endDate = endDate ? new Date(endDate) : semester.endDate;

    await academicYear.save();
    res.json({ message: "อัปเดตข้อมูลเทอมเรียบร้อย", data: academicYear });
  } catch (error) {
    console.error("Error updating semester:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
  }
};

// 📅 ดึงภาคเรียนปัจจุบัน
export const getCurrentSemester = async (req, res) => {
  try {
    const today = new Date();
    
    // หาทุกปีการศึกษาที่มี semester อยู่ในช่วงวันนี้
    const years = await AcademicYear.find({
      "semesters.startDate": { $lte: today },
      "semesters.endDate": { $gte: today },
    });

    if (!years || years.length === 0) {
      return res.status(404).json({ message: "ไม่มีภาคเรียนที่เปิดอยู่ตอนนี้" });
    }

    // หา semester ที่ตรงกับวันนี้
    let currentSemester = null;
    let currentYear = null;

    for (const year of years) {
      const semester = year.semesters.find(
        (s) => today >= s.startDate && today <= s.endDate
      );
      if (semester) {
        currentYear = year;
        currentSemester = semester;
        break;
      }
    }

    if (!currentSemester) {
      return res.status(404).json({ message: "ไม่พบภาคเรียนปัจจุบัน" });
    }

    res.json({ 
      year: currentYear.year, 
      semester: currentSemester 
    });
  } catch (error) {
    console.error("Error getting current semester:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};


////////////////////////////////////////////////////////////////////////

// 🔄 อัพเดทสถานะภาคเรียนอัตโนมัติ (รันด้วย Cron Job)
// ✅ ใช้สำหรับ: อัพเดทสถานะ current/upcoming/ended
// ❌ ไม่ใช้สำหรับ: อัพเดทข้อมูลนักศึกษา (ให้ใช้ระบบลงทะเบียนแทน)

export async function updateAcademicTermStatusAndStudents() {
  try {
    const today = new Date();
    const allYears = await AcademicYear.find();

    let currentYear = null;
    let currentSemesterNumber = null;

    // หาปีและเทอมปัจจุบัน + อัพเดทสถานะ
    for (const year of allYears) {
      let needsSave = false;
      
      for (const semester of year.semesters) {
        let newStatus;
        
        if (today >= semester.startDate && today <= semester.endDate) {
          newStatus = "current";
          currentYear = year.year;
          currentSemesterNumber = semester.semesterNumber;
        } else if (today < semester.startDate) {
          newStatus = "upcoming";
        } else {
          newStatus = "ended";
        }

        // เช็คว่าสถานะเปลี่ยนหรือไม่
        if (semester.status !== newStatus) {
          semester.status = newStatus;
          needsSave = true;
        }
      }

      // save เฉพาะที่มีการเปลี่ยนแปลง
      if (needsSave) {
        await year.save();
      }
    }

    console.log(
      currentYear && currentSemesterNumber
        ? `📘 [System] ปีการศึกษาปัจจุบัน: ${currentYear}/${currentSemesterNumber}`
        : "⚠️  [System] ไม่มีภาคเรียนที่เปิดอยู่ในปัจจุบัน"
    );

    console.log("✅ [System] อัพเดทสถานะภาคเรียนเรียบร้อย");
    
    return { currentYear, currentSemesterNumber };
  } catch (error) {
    console.error("❌ Error updating academic term status:", error);
    throw error;
  }
}

// 🎓 อัพเดทเทอม/ปีของนักศึกษาตามเงื่อนไข (เรียกเมื่อจำเป็น)
// ใช้สำหรับ: การ migrate ข้อมูล, การเลื่อนชั้นปีเป็นกลุ่ม
export const bulkUpdateStudentSemester = async (req, res) => {
  try {
    const { targetYear, targetSemester, filter = {} } = req.body;

    // Validation
    if (!targetYear || !targetSemester) {
      return res.status(400).json({ 
        message: "กรุณาระบุปีการศึกษาและเทอมที่ต้องการอัพเดท" 
      });
    }

    // ตรวจสอบว่ามีภาคเรียนนี้จริงหรือไม่
    const academicYear = await AcademicYear.findOne({ year: targetYear });
    if (!academicYear) {
      return res.status(404).json({ message: "ไม่พบปีการศึกษานี้" });
    }

    const semester = academicYear.semesters.find(
      s => s.semesterNumber === targetSemester
    );
    if (!semester) {
      return res.status(404).json({ message: "ไม่พบเทอมนี้" });
    }

    // สร้าง query filter
    const query = {
      role: "student",
      ...filter // เช่น { faculty: "วิศวกรรมศาสตร์", yearLevel: 1 }
    };

    // อัพเดทนักศึกษาตามเงื่อนไข
    const result = await User.updateMany(
      query,
      {
        $set: {
          semester: targetSemester,
          year: targetYear,
          updatedAt: new Date()
        }
      }
    );

    console.log(
      `✅ [Admin] อัพเดทนักศึกษา ${result.modifiedCount} คน -> ${targetYear}/${targetSemester}`
    );

    res.json({
      message: `อัพเดทนักศึกษาเรียบร้อย ${result.modifiedCount} คน`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        targetYear,
        targetSemester
      }
    });
  } catch (error) {
    console.error("Error bulk updating students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" });
  }
};

// 🎯 อัพเดทชั้นปี/เทอมของนักศึกษาตาม Enrollment
// ใช้สำหรับ: อัพเดทอัตโนมัติเมื่อนักศึกษาลงทะเบียน
export const updateStudentFromEnrollment = async (studentId, enrollmentData) => {
  try {
    const { year, semester } = enrollmentData;
    
    // ดึงข้อมูลนักศึกษาปัจจุบัน
    const student = await User.findById(studentId);
    if (!student) {
      console.error(`❌ ไม่พบนักศึกษา ${studentId}`);
      return false;
    }

    // คำนวณ yearLevel อัตโนมัติ
    // หลักการ: ถ้าลงทะเบียนเทอม 1 ของปีการศึกษาใหม่ (ที่มากกว่าปีเก่า) → เลื่อนชั้นปี
    let newYearLevel = student.yearLevel || 1;
    
    if (semester === 1 && student.year && year > student.year) {
      // เช่น: ปีการศึกษาเก่า = 2567/2, ลงทะเบียนใหม่ = 2568/1 → เลื่อนชั้นปี
      newYearLevel = (student.yearLevel || 1) + 1;
      console.log(
        `📈 [Auto-Promote] ${student.student_id}: ชั้นปี ${student.yearLevel} → ${newYearLevel}`
      );
    }
    
    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          year,
          semester,
          yearLevel: newYearLevel,
          lastEnrollmentDate: new Date()
        }
      }
    );

    console.log(
      `✅ [Enrollment] ${student.student_id} -> ${year}/${semester} (ชั้นปี ${newYearLevel})`
    );

    return true;
  } catch (error) {
    console.error("Error updating student from enrollment:", error);
    return false;
  }
};

// 📊 เลื่อนชั้นปีนักศึกษาทั้งหมด (ใช้ตอนจบเทอม 2/3)
export const promoteStudents = async (req, res) => {
  try {
    const { fromYear, fromYearLevel, fromSemester } = req.body;

    // Validation
    if (!fromYear || !fromYearLevel || !fromSemester) {
      return res.status(400).json({ 
        message: "กรุณาระบุข้อมูลให้ครบถ้วน" 
      });
    }

    // คำนวณปีและเทอมถัดไป
    const nextYear = fromSemester === 2 ? Number(fromYear) + 1 : fromYear;
    const nextSemester = fromSemester === 2 ? 1 : fromSemester + 1;
    const nextYearLevel = fromSemester === 2 ? fromYearLevel + 1 : fromYearLevel;

    // อัพเดทนักศึกษา
    const result = await User.updateMany(
      {
        role: "student",
        year: fromYear,
        yearLevel: fromYearLevel,
        semester: fromSemester,
        status: "active" // เฉพาะนักศึกษาที่ยังศึกษาอยู่
      },
      {
        $set: {
          year: nextYear,
          semester: nextSemester,
          yearLevel: nextYearLevel,
          updatedAt: new Date()
        }
      }
    );

    console.log(
      `📚 [Promotion] เลื่อนชั้นปี: ${fromYearLevel}/${fromSemester} -> ${nextYearLevel}/${nextSemester} (${result.modifiedCount} คน)`
    );

    res.json({
      message: `เลื่อนชั้นปีเรียบร้อย ${result.modifiedCount} คน`,
      data: {
        from: { year: fromYear, yearLevel: fromYearLevel, semester: fromSemester },
        to: { year: nextYear, yearLevel: nextYearLevel, semester: nextSemester },
        studentsPromoted: result.modifiedCount
      }
    });
  } catch (error) {
    console.error("Error promoting students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเลื่อนชั้นปี" });
  }
};

// 🔍 Preview การเลื่อนชั้นปี (ดูรายชื่อก่อนเลื่อนจริง)
export const previewPromotion = async (req, res) => {
  try {
    const { fromYear, fromYearLevel, fromSemester } = req.query;

    if (!fromYear || !fromYearLevel || !fromSemester) {
      return res.status(400).json({ 
        message: "กรุณาระบุข้อมูลให้ครบถ้วน" 
      });
    }

    // คำนวณปีและเทอมถัดไป
    const nextYear = fromSemester == 2 ? parseInt(fromYear) + 1 : parseInt(fromYear);
    const nextSemester = fromSemester == 2 ? 1 : parseInt(fromSemester) + 1;
    const nextYearLevel = fromSemester == 2 ? parseInt(fromYearLevel) + 1 : parseInt(fromYearLevel);

    // ดึงรายชื่อนักศึกษาที่จะเลื่อนชั้น
    const students = await User.find(
      {
        role: "student",
        year: parseInt(fromYear),
        yearLevel: parseInt(fromYearLevel),
        semester: parseInt(fromSemester),
        status: "active"
      },
      "student_id name faculty major email"
    ).limit(100); // จำกัดไม่เกิน 100 คนสำหรับ preview

    const totalCount = await User.countDocuments({
      role: "student",
      year: parseInt(fromYear),
      yearLevel: parseInt(fromYearLevel),
      semester: parseInt(fromSemester),
      status: "active"
    });

    res.json({
      from: { 
        year: parseInt(fromYear), 
        yearLevel: parseInt(fromYearLevel), 
        semester: parseInt(fromSemester) 
      },
      to: { 
        year: nextYear, 
        yearLevel: nextYearLevel, 
        semester: nextSemester 
      },
      totalCount,
      previewList: students,
      message: `พบนักศึกษา ${totalCount} คน ที่จะเลื่อนชั้นปี`
    });
  } catch (error) {
    console.error("Error previewing promotion:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดูรายชื่อ" });
  }
};
