import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import curriculumRoutes from "./routes/curriculumRoutes.js";
import patternRoutes from "./routes/patternRoutes.js";
import headOfMajorRoutes from "./routes/headOfMajorRoutes.js";
import patternRequestRoutes from "./routes/patternRequestRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import academicYearRoutes from "./routes/academicYearRoutes.js";
import { updateAcademicTermStatusAndStudents } from "./controllers/academicYearController.js";

dotenv.config();

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch(err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // ไม่ exit process เพื่อให้ server run ต่อ
  }
})();


const app = express();
app.use(cors());
app.use(express.json());

// 📚 Swagger Documentation with custom options
const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "CourseFlow API Documentation",
  swaggerOptions: {
    persistAuthorization: true, // จำ token ไว้หลัง refresh
    displayRequestDuration: true,
    tryItOutEnabled: true,
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/curriculums", curriculumRoutes);
app.use("/api/patterns", patternRoutes);
app.use("/api/head-of-major", headOfMajorRoutes);
app.use("/api/pattern-requests", patternRequestRoutes);
app.use("/api", metadataRoutes);
app.use("/api/academic-years", academicYearRoutes);

try {
  updateAcademicTermStatusAndStudents();
} catch(err) {
  console.error("Cron initial run failed:", err);
}

setInterval(() => {
  try {
    console.log("🕐 [Cron] เริ่มอัพเดทสถานะภาคเรียน...");
    updateAcademicTermStatusAndStudents();
  } catch(err) {
    console.error("Cron error:", err);
  }
}, 24 * 60 * 60 * 1000);


console.log("✅ [Cron] ตั้งค่า Auto-update สถานะภาคเรียนเรียบร้อย (ทุก 24 ชม.)");

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message });
});

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
});
