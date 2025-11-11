import mongoose from "mongoose";

const headOfMajorSchema = new mongoose.Schema({
  faculty: {
    type: String,required: true,trim: true,
  },
  major: {
    type: String,required: true,trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,
  },
  createdAt: {
    type: Date,default: Date.now,
  },
});

export default mongoose.model("HeadOfMajor", headOfMajorSchema);
