import Course, { PatternByYear } from "../models/Course.js";
import { User } from "../models/Users.js";
import mongoose from "mongoose";

export const createPattern = async (req, res) => {
  try {
    const { year, faculties } = req.body;

    if (!year || !Array.isArray(faculties)) {
      return res
        .status(400)
        .json({ message: "year and faculties are required" });
    }

    // ตรวจว่ามีปีนี้อยู่หรือยัง ถ้าไม่มีให้สร้างใหม่
    let yearDoc = await PatternByYear.findOne({ year }).lean(false);
    if (!yearDoc) {
      yearDoc = new PatternByYear({ year, faculties: [] });
    }

    faculties.forEach((facultyData) => {
      const { facultyName, majors } = facultyData;
      if (!facultyName) throw new Error("facultyName is required");

      // หา faculty เดิม
      let faculty = yearDoc.faculties.find(
        (f) => f.facultyName === facultyName
      );
      if (!faculty) {
        faculty = yearDoc.faculties.create({ facultyName, majors: [] });
        yearDoc.faculties.push(faculty);
      }

      // วน loop majors
      majors.forEach((majorData) => {
        const { majorName, years } = majorData;
        if (!majorName) throw new Error("majorName is required");

        let major = faculty.majors.find((m) => m.majorName === majorName);
        if (!major) {
          // ถ้ายังไม่มี major นี้
          major = {
            majorName,
            years: Array.isArray(years)
              ? years.map((yearData) => ({
                  yearLevel: yearData.yearLevel,
                  semesters: Array.isArray(yearData.semesters)
                    ? yearData.semesters.map((semData) => ({
                        semesterNumber: semData.semesterNumber,
                        patterns: Array.isArray(semData.patterns)
                          ? semData.patterns
                          : [],
                      }))
                    : [],
                }))
              : [],
          };
          faculty.majors.push(major);
        } else {
          // ถ้ามี major อยู่แล้ว ให้ merge years/semesters/patterns
          years.forEach((yearData) => {
            let yearLevelObj = major.years.find(
              (y) => Number(y.yearLevel) === Number(yearData.yearLevel)
            );

            if (!yearLevelObj) {
              yearLevelObj = {
                yearLevel: yearData.yearLevel,
                semesters: yearData.semesters.map((semData) => ({
                  semesterNumber: semData.semesterNumber,
                  patterns: semData.patterns || [],
                })),
              };
              major.years.push(yearLevelObj);
            } else {
              yearData.semesters.forEach((semData) => {
                let semesterObj = yearLevelObj.semesters.find(
                  (s) => s.semesterNumber === semData.semesterNumber
                );
                if (!semesterObj) {
                  semesterObj = {
                    semesterNumber: semData.semesterNumber,
                    patterns: semData.patterns || [],
                  };
                  yearLevelObj.semesters.push(semesterObj);
                } else {
                  semData.patterns.forEach((pattern) => {
                    const existingIndex = semesterObj.patterns.findIndex(
                      (p) =>
                        p.patternName.toLowerCase() ===
                        pattern.patternName.toLowerCase()
                    );

                    if (existingIndex !== -1) {
                      // ✅ ถ้าพบ Pattern ซ้ำ → อัพเดทแทนการ throw error
                      console.log(
                        `⚠️ [Pattern Update] "${pattern.patternName}" มีอยู่แล้ว - อัพเดทข้อมูลใหม่`
                      );
                      semesterObj.patterns[existingIndex] = pattern;
                    } else {
                      // ถ้าไม่ซ้ำ — เพิ่มได้
                      semesterObj.patterns.push(pattern);
                    }
                  });
                }
              });
            }
          });
        }
      });
    });

    await yearDoc.save();
    
    console.log(
      `✅ [Pattern Created] Year: ${year}, Faculties: ${faculties.length}`
    );
    
    res.status(201).json(yearDoc);
  } catch (err) {
    console.error("❌ [Pattern Error]", err.message);
    res.status(400).json({ message: err.message });
  }
};

export const getAllPatterns = async (req, res) => {
  try {
    const years = await PatternByYear.find().lean(); // lean() จะได้ plain object

    // loop ทุก faculty → major → year → semester → pattern → course
    for (const yearDoc of years) {
      for (const faculty of yearDoc.faculties) {
        for (const major of faculty.majors) {
          for (const yearLevel of major.years) {
            for (const semester of yearLevel.semesters) {
              for (const pattern of semester.patterns) {
                // map course_id เป็น object
                for (let i = 0; i < pattern.courses.length; i++) {
                  const courseId = pattern.courses[i].course_id;
                  const course = await Course.findById(courseId)
                    .select("course_id name credit sections")
                    .lean();

                  if (course) {
                    // map section_id เป็น object
                    pattern.courses[i].course_id = course;
                    pattern.courses[i].sections = pattern.courses[
                      i
                    ].sections.map((s) =>
                      course.sections.find(
                        (sec) => sec._id.toString() === s.section_id.toString()
                      )
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    res.json(years);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const getPatternById = async (req, res) => {
  try {
    const patternId = req.params.id;

    // ใช้ lean() คืน plain object
    const yearDocs = await PatternByYear.find().lean();

    let foundPattern = null;

    for (const yearDoc of yearDocs) {
      for (const faculty of yearDoc.faculties) {
        for (const major of faculty.majors) {
          for (const yearObj of major.years) {
            for (const semester of yearObj.semesters) {
              const pat = semester.patterns.find(
                (p) => p._id.toString() === patternId
              );

              if (pat) {
                // ดึงข้อมูล course และ section จาก DB
                const populatedCourses = await Promise.all(
                  pat.courses.map(async (c) => {
                    // ดึง course ปกติ
                    const course = await Course.findById(c.course_id).populate({
                      path: "sections.teacher_id", // populate teacher ของ subdocument sections
                      select: "name", // ดึงเฉพาะชื่อ
                    });

                    if (!course) return null;

                    // filter sections ที่อยู่ใน pattern
                    const sections = course.sections.filter((sec) =>
                      c.sections.some(
                        (s) => s.section_id.toString() === sec._id.toString()
                      )
                    );

                    return {
                      _id: course._id,
                      course_id: course._id,
                      name: course.name,
                      course_id: course.course_id,
                      credit: course.credit,
                      year_required: course.year_required,
                      semester_required: course.semester_required,
                      sections: sections.map((sec) => ({
                        section_id: sec._id,
                        section_number: sec.section_number,
                        type: sec.type,
                        teacher: sec.teacher_id, // populated object
                        schedule: sec.schedule,
                        enrolled_count: sec.enrolled_count,
                        max_students: sec.max_students,
                        original_max_students: sec.original_max_students,
                        linked_section: sec.linked_section,
                      })),
                    };
                  })
                );

                foundPattern = {
                  year: yearDoc.year,
                  facultyName: faculty.facultyName,
                  majorName: major.majorName,
                  yearLevel: yearObj.yearLevel,
                  semesterNumber: semester.semesterNumber,
                  patternName: pat.patternName,
                  courses: populatedCourses.filter(Boolean), // ลบ null
                };

                break;
              }
            }
            if (foundPattern) break;
          }
          if (foundPattern) break;
        }
        if (foundPattern) break;
      }
      if (foundPattern) break;
    }

    if (!foundPattern)
      return res.status(404).json({ message: "Pattern not found" });

    res.json(foundPattern);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getPatternsForUser = async (req, res) => {
  try {
    const userId = req.params.user_id;

    // หา user จาก token
    const user = await User.findById(userId).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // หา pattern ของปีที่ตรงกับ user.year
    const yearDocs = await PatternByYear.find({ year: user.year }).lean();

    const filteredPatterns = yearDocs.flatMap((yearDoc) =>
      Array.isArray(yearDoc.faculties)
        ? yearDoc.faculties
            .filter((faculty) => faculty.facultyName === user.faculty)
            .flatMap((faculty) =>
              faculty.majors
                .filter((major) => major.majorName === user.major)
                .flatMap((major) =>
                  major.years
                    .filter((y) => y.yearLevel === user.yearLevel)
                    .flatMap((y) =>
                      y.semesters
                        .filter((s) => s.semesterNumber === user.semester)
                        .flatMap((s) => s.patterns)
                    )
                )
            )
        : []
    );

    if (filteredPatterns.length === 0) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // ดึงข้อมูลวิชาเพิ่มเติมจาก collection Course
    const courseIds = filteredPatterns
      .flatMap((p) => p.courses.map((c) => c.course_id))
      .filter(Boolean); // กรอง null/undefined ออก

    const coursesData = await Course.find({
      _id: { $in: courseIds },
    })
      .select("course_id name semester_required year_required")
      .lean();

    // สร้าง Map สำหรับ lookup ที่เร็วขึ้น
    const coursesMap = new Map(coursesData.map((c) => [c._id.toString(), c]));

    const enrichedPatterns = filteredPatterns.map((pattern) => ({
      ...pattern,
      courses: (pattern.courses || []).map((course) => {
        const match = coursesMap.get(course.course_id.toString());

        if (!match) return course;

        // Destructure เพื่อไม่เอา _id จาก match
        const { _id: matchId, ...courseDetails } = match;

        return {
          ...course,
          ...courseDetails, // จะได้ course_id, name, semester_required, year_required
        };
      }),
    }));
    res.json(enrichedPatterns);
  } catch (err) {
    console.error("Error in getPatternsForUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// แก้ไข pattern (รวมถึงเพิ่ม/แก้ไข course ใน pattern)
export const updatePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ message: "Pattern not found" });

    Object.keys(req.body).forEach((key) => {
      pattern[key] = req.body[key];
    });

    await pattern.save();
    res.json(pattern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const deletePattern = async (req, res) => {
  try {
    const { id, year } = req.params; // รับ ObjectId ของ pattern ที่จะลบ
    console.log("Deleting pattern:", id, "from year:", year);

    // ตรวจสอบว่า patternId เป็น ObjectId ถูกต้องไหม
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid pattern ID" });
    }

    const result = await PatternByYear.updateOne(
      { year },
      {
        $pull: {
          "faculties.$[].majors.$[].years.$[].semesters.$[].patterns": {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    res.json({ message: "Pattern deleted successfully", result });
  } catch (err) {
    console.error("❌ Delete pattern error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ---

// POST /api/patterns/:id/courses
export const addCourseToPattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);
    if (!pattern) return res.status(404).json({ message: "Pattern not found" });

    const { course_id, section_ids } = req.body; // section_ids = array ของ ObjectId ที่เลือก

    const course = await Course.findById(course_id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // ตรวจสอบ section_ids ว่ามีอยู่จริงใน course.sections
    const validSectionIds = course.sections
      .filter((s) => section_ids.includes(s._id.toString()))
      .map((s) => ({ section_id: s._id }));

    // เพิ่ม course + section ที่เลือกเข้า pattern
    pattern.courses.push({
      course_id,
      sections: validSectionIds,
    });

    await pattern.save();
    res.json(pattern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
