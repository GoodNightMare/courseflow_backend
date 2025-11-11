import mongoose from "mongoose";

const patternRequestSchema = new mongoose.Schema(
  {
    patternName: { type: String, required: true },
    faculty: { type: String, required: true },
    major: { type: String, required: true },
    year: { type: Number, required: true },
    yearLevel: { type: Number, required: true },
    semester: { type: Number, required: true },
    courses: [
      {
        course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        sections: [
          {
            section_id: { type: mongoose.Schema.Types.ObjectId, required: true },
            section_number: { type: String, required: true },
            type: { type: String, required: true },
            teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            schedules: [
              {
                day: { type: String },
                time: { type: String },
                location: { type: String },
              },
            ],
          },
        ],
      },
    ],
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PatternRequest", patternRequestSchema);
