import mongoose from "mongoose";
import PatternRequest from "../models/PatternRequest.js";
import HeadOfMajor from "../models/HeadOfMajor.js";

// ✅ สร้างชื่อ Pattern อัตโนมัติ (เช่น Pattern 1, Pattern 2, ...)
export const generatePatternName = async (req, res) => {
  try {
    const { faculty, major, year, yearLevel, semester } = req.query;

    if (!faculty || !major || !year || !yearLevel || !semester) {
      return res.status(400).json({ message: "กรุณาระบุข้อมูลให้ครบถ้วน" });
    }

    // ✅ หา Pattern ที่ได้รับการอนุมัติแล้วเท่านั้น (ถ้าถูกปฏิเสธให้ใช้เลขเดิม)
    const existingPatterns = await PatternRequest.find({
      faculty,
      major,
      year: parseInt(year),
      yearLevel: parseInt(yearLevel),
      semester: parseInt(semester),
      status: "approved", // ✅ นับเฉพาะ Pattern ที่อนุมัติแล้ว
    }).select("patternName").lean();

    // ✅ หาเลข Pattern ที่ใหญ่ที่สุด
    let maxNumber = 0;
    existingPatterns.forEach((pattern) => {
      const match = pattern.patternName.match(/Pattern\s+(\d+)/i);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    });

    // ✅ สร้างชื่อ Pattern ใหม่
    const nextNumber = maxNumber + 1;
    const suggestedName = `Pattern ${nextNumber}`;

    res.json({ suggestedName, nextNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างชื่อ Pattern" });
  }
};

// ✅ สร้าง Pattern Request (Teacher - Head of Major only)
export const createPatternRequest = async (req, res) => {
  try {
    const { patternName, faculty, major, year, yearLevel, semester, courses } = req.body;

    const headPosition = await HeadOfMajor.findOne({ 
      teacher: req.user._id,
      faculty,
      major 
    });

    if (!headPosition) {
      return res.status(403).json({ 
        message: "คุณไม่ได้เป็นหัวหน้าสาขา หรือไม่มีสิทธิ์สร้าง Pattern ในคณะ/สาขานี้" 
      });
    }

    if (!patternName || !faculty || !major || !year || !yearLevel || !semester || !courses) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const newPatternRequest = new PatternRequest({
      patternName,
      faculty,
      major,
      year,
      yearLevel,
      semester,
      courses,
      createdBy: req.user._id,
      status: "pending",
    });

    await newPatternRequest.save();
    res.status(201).json(newPatternRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้าง Pattern Request" });
  }
};

// ✅ ดึง Pattern Requests ทั้งหมด (Admin)
export const getAllPatternRequests = async (req, res) => {
  try {
    const { faculty, major, year, status } = req.query;
    const filter = {};
    
    if (faculty) filter.faculty = faculty;
    if (major) filter.major = major;
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;

    let requests = await PatternRequest.find(filter)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 });

    for (let request of requests) {
      for (let course of request.courses) {
        const courseDoc = await mongoose.model("Course").findById(course.course_id).select("course_id name credit");
        if (courseDoc) course.course_id = courseDoc;

        for (let section of course.sections) {
          if (section.teacher_id) {
            const teacherDoc = await mongoose.model("User").findById(section.teacher_id).select("name email");
            if (teacherDoc) section.teacher_id = teacherDoc;
          }
        }
      }
    }

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// ✅ ดึง Pattern Requests ของ Teacher (ที่สร้างเอง)
export const getMyPatternRequests = async (req, res) => {
  try {
    let requests = await PatternRequest.find({ createdBy: req.user._id })
      .populate("approvedBy", "name email")
      .populate("rejectedBy", "name email")
      .sort({ createdAt: -1 })
      .lean(); // ✅ ใช้ lean() เพื่อให้ได้ plain JavaScript object

    console.log(`\n=== Found ${requests.length} requests for user ${req.user._id} ===`);

    for (let request of requests) {
      console.log(`\nProcessing request: ${request.patternName}`);
      console.log(`Courses count: ${request.courses.length}`);
      
      for (let course of request.courses) {
        console.log(`\n  Course ID to lookup: ${course.course_id}`);
        const courseDoc = await mongoose.model("Course").findById(course.course_id).select("course_id name credit sections");
        
        if (courseDoc) {
          console.log(`  Found course: ${courseDoc.course_id} - ${courseDoc.name}`);
          console.log(`  Course sections count: ${courseDoc.sections.length}`);
          
          // ✅ Populate course_id (ตอนนี้เป็น plain object แล้ว ทำได้)
          course.course_id = {
            _id: courseDoc._id,
            course_id: courseDoc.course_id,
            name: courseDoc.name,
            credit: courseDoc.credit
          };

          console.log(`  Populated course_id:`, course.course_id);

          // Populate schedule และ teacher_id จาก courseDoc.sections
          console.log(`  Pattern course sections count: ${course.sections.length}`);
          for (let section of course.sections) {
            console.log(`    Looking for section_id: ${section.section_id}`);
            const courseSection = courseDoc.sections.find(s => s._id.toString() === section.section_id.toString());
            
            if (courseSection) {
              console.log(`    Found section: ${courseSection.section_number} (${courseSection.type})`);
              console.log(`    Schedule from Course:`, courseSection.schedule);
              
              // ใช้ schedules (มี s) ตาม Schema ของ PatternRequest
              section.schedules = courseSection.schedule || [];
              section.section_number = courseSection.section_number;
              section.type = courseSection.type;
              
              console.log(`    Assigned schedules to section:`, section.schedules);
            } else {
              console.log(`    Section not found in course!`);
            }

            if (section.teacher_id) {
              const teacherDoc = await mongoose.model("User").findById(section.teacher_id).select("name email");
              if (teacherDoc) section.teacher_id = teacherDoc;
            }
          }
        } else {
          console.log(`  Course not found!`);
        }
      }
    }

    console.log(`\n=== Sending response ===`);
    console.log("First request courses:", JSON.stringify(requests[0]?.courses, null, 2));
    res.json(requests);
  } catch (err) {
    console.error("Error in getMyPatternRequests:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// ✅ อนุมัติ Pattern Request (Admin only)
export const approvePatternRequest = async (req, res) => {
  try {
    const request = await PatternRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "ไม่พบ Pattern Request" });

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Pattern Request นี้ถูกดำเนินการไปแล้ว" });
    }

    request.status = "approved";
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    res.json({ message: "อนุมัติ Pattern Request สำเร็จ", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอนุมัติ" });
  }
};

// ✅ ไม่อนุมัติ Pattern Request (Admin only)
export const rejectPatternRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await PatternRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "ไม่พบ Pattern Request" });

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Pattern Request นี้ถูกดำเนินการไปแล้ว" });
    }

    request.status = "rejected";
    request.rejectedBy = req.user._id;
    request.rejectedAt = new Date();
    request.rejectionReason = reason || "ไม่ระบุเหตุผล";
    await request.save();

    res.json({ message: "ไม่อนุมัติ Pattern Request", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการไม่อนุมัติ" });
  }
};

// ✅ ดึงปีการศึกษาทั้งหมดที่มี Pattern Request
export const getAllYears = async (req, res) => {
  try {
    const years = await PatternRequest.distinct("year");
    res.json(years.sort((a, b) => b - a));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
