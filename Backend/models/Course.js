import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  section_number: { type: String, required: true },
  type: { type: String, enum: ["lecture", "lab"], default: "lecture" },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  schedule: [
    {
      day: { type: String },
      time: { type: String },
      location: { type: String },
    },
  ],
  original_max_students: { type: Number, required: true }, 
  max_students: { type: Number, required: true }, 
  enrolled_count: { type: Number, default: 0 },
  linked_section: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const courseSchema = new mongoose.Schema(
  {
    course_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    credit: {
      theory: { type: Number, default: 0 },
      practice: { type: Number, default: 0 },
      self_study: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    sections: [sectionSchema],
    prerequisites: [{ type: String }],
    faculty: { type: String },
    major: { type: String },
    year: { type: Number },
    semester: { type: Number },
    year_required: { type: Number, required: false }, 
    semester_required: { type: Number, required: false }, 
  },
  { timestamps: true }
);

const patternSectionSchema = new mongoose.Schema({
  section_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const patternCourseSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    index: false
  }, 
  sections: [patternSectionSchema],
});

const patternSchema = new mongoose.Schema(
  {
    patternName: { type: String, required: true },
    courses: [patternCourseSchema], 
  },
);

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  patterns: [patternSchema]
});

const yearLevelSchema = new mongoose.Schema({
  yearLevel: { type: Number, required: true },
  semesters: [semesterSchema]
});

const majorSchema = new mongoose.Schema({
  majorName: { type: String, required: true }, 
  years: [yearLevelSchema]
});


const facultySchema = new mongoose.Schema({
  facultyName: { type: String, required: true }, 
  majors: [majorSchema],
});

const patternByYearSchema = new mongoose.Schema({
  year: { type: Number, required: true }, 
  faculties: [facultySchema]
}, { timestamps: true });



export default mongoose.model("Course", courseSchema);
export const PatternByYear = mongoose.model("PatternByYear", patternByYearSchema);
