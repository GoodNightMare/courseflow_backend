import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student_id: {
      type: String,
      ref: "User",
      required: true,
    },

    courses: [
      {
        course_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        sections: [
          {
            section_id: {
              type: mongoose.Schema.Types.ObjectId, 
              required: true,
              ref: "Course.sections",
            },
            grade: { type: String, default: null },
            status: {
              type: String,
              enum: ["enrolled", "completed", "dropped"],
              default: "enrolled",
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
