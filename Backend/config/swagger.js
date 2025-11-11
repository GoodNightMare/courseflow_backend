import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CourseFlow API Documentation",
      version: "1.0.0",
      description: `
# CourseFlow API Documentation

## 🚀 วิธีใช้งาน Swagger

### 1️⃣ Login เพื่อรับ Token
1. เลื่อนลงไปที่ **🔐 Authentication** → **POST /api/auth/login**
2. กด **"Try it out"**
3. เลือก Example Account (Admin/Teacher/Student) หรือกรอก email และ password
4. กด **"Execute"**
5. คัดลอก **token** จาก Response

### 2️⃣ ใส่ Token เพื่อใช้งาน API
1. กดปุ่ม **"Authorize" 🔓** ด้านบนขวา
2. วาง token ที่คัดลอกมาในช่อง **Value** (ไม่ต้องใส่ "Bearer" ข้างหน้า)
3. กด **"Authorize"** แล้วกด **"Close"**
4. ตอนนี้สามารถเรียกใช้ API อื่นๆ ได้แล้ว! ✅

### 3️⃣ ทดสอบ API
- เลือก Endpoint ที่ต้องการ
- กด **"Try it out"**
- กรอกข้อมูลที่จำเป็น
- กด **"Execute"**

---

## 👥 บัญชีทดสอบ

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | admin@gmail.com | admin123 |
| 👨‍🏫 Teacher | teacherF@gmail.com | teacherF |
| 👨‍🎓 Student | studentA@gmail.com | studentA |

---

## 📋 API แยกตาม Role

- **🔐 Authentication** - Login & Register
- **👨‍💼 Admin** - จัดการผู้ใช้, ตั้งค่าระบบ
- **👨‍🏫 Teacher** - ดูนักเรียน, จัดการ Pattern Request
- **👨‍🎓 Student** - ดูข้อมูลตัวเอง, ลงทะเบียน
- **📚 Courses** - จัดการรายวิชา
- **📝 Enrollments** - ลงทะเบียนเรียน
- **📋 Patterns** - รูปแบบการลงทะเบียน
- **📄 Pattern Requests** - คำขอสร้าง Pattern
- **📖 Curriculum** - หลักสูตร
- **📅 Academic Years** - ปีการศึกษา/ภาคเรียน
- **👔 Head of Major** - หัวหน้าสาขา
- **🔧 Metadata** - ข้อมูล Master (คณะ, สาขา)
      `,
      contact: {
        name: "CourseFlow Team",
        email: "support@courseflow.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3300",
        description: "Development Server",
      },
     
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: `
**วิธีใส่ Token:**

1. Login ที่ POST /api/auth/login
2. คัดลอก token จาก Response
3. กดปุ่ม "Authorize" 🔓 ด้านบน
4. วาง token ในช่อง Value (ไม่ต้องใส่ "Bearer")
5. กด "Authorize" แล้วกด "Close"

Token จะถูกบันทึกไว้อัตโนมัติ (ถึงแม้จะ refresh หน้าเว็บ)
          `,
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "ชื่อผู้ใช้",
            },
            email: {
              type: "string",
              description: "อีเมล",
            },
            role: {
              type: "string",
              enum: ["student", "teacher", "admin"],
              description: "บทบาทของผู้ใช้",
            },
            faculty: {
              type: "string",
              description: "คณะ",
            },
            major: {
              type: "string",
              description: "สาขา",
            },
            year: {
              type: "number",
              description: "ชั้นปี (สำหรับ student)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Course: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            course_id: {
              type: "string",
              description: "รหัสวิชา",
            },
            course_name_en: {
              type: "string",
              description: "ชื่อวิชาภาษาอังกฤษ",
            },
            course_name_th: {
              type: "string",
              description: "ชื่อวิชาภาษาไทย",
            },
            credit: {
              type: "number",
              description: "หน่วยกิต",
            },
            sections: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Section",
              },
            },
          },
        },
        Section: {
          type: "object",
          properties: {
            section_id: {
              type: "string",
              description: "รหัส Section",
            },
            type: {
              type: "string",
              enum: ["lecture", "lab"],
              description: "ประเภท Section",
            },
            day: {
              type: "string",
              description: "วันที่เรียน",
            },
            time_start: {
              type: "string",
              description: "เวลาเริ่มเรียน (HH:mm)",
            },
            time_end: {
              type: "string",
              description: "เวลาเลิกเรียน (HH:mm)",
            },
            room: {
              type: "string",
              description: "ห้องเรียน",
            },
            max_students: {
              type: "number",
              description: "จำนวนนักเรียนสูงสุด",
            },
            enrolled_students: {
              type: "number",
              description: "จำนวนนักเรียนที่ลงทะเบียนแล้ว",
            },
            available_seats: {
              type: "number",
              description: "จำนวนที่นั่งว่าง",
            },
            teachers: {
              type: "array",
              items: {
                type: "string",
              },
              description: "รายชื่ออาจารย์ผู้สอน",
            },
          },
        },
        Pattern: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            year: {
              type: "string",
              description: "ปีการศึกษา",
            },
            faculties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  facultyName: {
                    type: "string",
                  },
                  majors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        majorName: {
                          type: "string",
                        },
                        years: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              yearLevel: {
                                type: "number",
                              },
                              semesters: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    semesterNumber: {
                                      type: "number",
                                    },
                                    patterns: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          patternName: {
                                            type: "string",
                                          },
                                          courses: {
                                            type: "array",
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        PatternRequest: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            patternName: {
              type: "string",
              description: "ชื่อ Pattern",
            },
            faculty: {
              type: "string",
              description: "คณะ",
            },
            major: {
              type: "string",
              description: "สาขา",
            },
            year: {
              type: "string",
              description: "ปีการศึกษา",
            },
            yearLevel: {
              type: "number",
              description: "ชั้นปี",
            },
            semester: {
              type: "number",
              description: "ภาคเรียน",
            },
            courses: {
              type: "array",
              description: "รายวิชาใน Pattern",
            },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
              description: "สถานะคำขอ",
            },
            createdBy: {
              type: "string",
              description: "ผู้สร้างคำขอ",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Enrollment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            student_id: {
              type: "string",
              description: "รหัสนักเรียน",
            },
            course_id: {
              type: "string",
              description: "รหัสวิชา",
            },
            section_id: {
              type: "string",
              description: "รหัส Section",
            },
            enrolled_at: {
              type: "string",
              format: "date-time",
              description: "วันที่ลงทะเบียน",
            },
          },
        },
        Curriculum: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            faculty: {
              type: "string",
              description: "คณะ",
            },
            major: {
              type: "string",
              description: "สาขา",
            },
            year: {
              type: "number",
              description: "ชั้นปี",
            },
            semester: {
              type: "number",
              description: "ภาคเรียน",
            },
            courses: {
              type: "array",
              items: {
                type: "string",
              },
              description: "รายการ course_id ในหลักสูตร",
            },
          },
        },
        AcademicYear: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            year: {
              type: "string",
              description: "ปีการศึกษา เช่น 2567",
            },
            semesters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  semesterNumber: {
                    type: "number",
                    description: "ภาคเรียนที่ 1, 2, 3",
                  },
                  startDate: {
                    type: "string",
                    format: "date",
                  },
                  endDate: {
                    type: "string",
                    format: "date",
                  },
                  isCurrent: {
                    type: "boolean",
                  },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "ข้อความ error",
            },
            error: {
              type: "string",
              description: "รายละเอียด error",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "🔐 Authentication",
        description: "API สำหรับการ Login และ Register",
      },
      {
        name: "👨‍🎓 Student",
        description: "API สำหรับ Student (ต้อง login และมี role = student)",
      },
      {
        name: "👨‍🏫 Teacher",
        description: "API สำหรับ Teacher (ต้อง login และมี role = teacher)",
      },
      {
        name: "👨‍💼 Admin",
        description: "API สำหรับ Admin (ต้อง login และมี role = admin)",
      },
      {
        name: "📚 Courses",
        description: "API สำหรับจัดการข้อมูลวิชาเรียน",
      },
      {
        name: "📝 Enrollments",
        description: "API สำหรับจัดการการลงทะเบียนเรียน",
      },
      {
        name: "📋 Patterns",
        description: "API สำหรับจัดการ Pattern (รูปแบบการลงทะเบียน)",
      },
      {
        name: "📄 Pattern Requests",
        description: "API สำหรับจัดการคำขอสร้าง Pattern",
      },
      {
        name: "📖 Curriculum",
        description: "API สำหรับจัดการหลักสูตร",
      },
      {
        name: "📅 Academic Years",
        description: "API สำหรับจัดการปีการศึกษาและภาคเรียน",
      },
      {
        name: "👔 Head of Major",
        description: "API สำหรับจัดการหัวหน้าสาขา",
      },
      {
        name: "🔧 Metadata",
        description: "API สำหรับดึงข้อมูล Metadata (คณะ, สาขา)",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
