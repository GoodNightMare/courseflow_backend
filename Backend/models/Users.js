import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const options = { discriminatorKey: "role", collection: "users" };

// 🔹 Base User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  options
);

// hash password ก่อน save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ตรวจสอบ password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);

// 🔹 Student Schema
const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  faculty: String,
  major: String,
  year: Number,
  yearLevel: Number,
  semester: Number,
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["active", "graduated", "suspended", "dropped"],
    default: "active",
  },
});

export const Student = User.discriminator("student", studentSchema);

// 🔹 Teacher Schema
const teacherSchema = new mongoose.Schema({
  teacher_id: { type: String, required: true },
  faculty: String,
  major: String,
  status: {
    type: String,
    enum: ["active", "retired", "resigned", "suspended"],
    default: "active",
  },
});

export const Teacher = User.discriminator("teacher", teacherSchema);

export const Admin = User.discriminator("admin", new mongoose.Schema({}));
