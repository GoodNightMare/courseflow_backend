import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["upcoming", "current", "ended"],
    default: "upcoming",
  },
});

const academicYearSchema = new mongoose.Schema({
  year: { type: Number, required: true, unique: true },
  semesters: [semesterSchema],
});

export default mongoose.model("AcademicYear", academicYearSchema);
