// Error Codes for CourseFlow API
// รหัส Error แยกตามหมวดหมู่เพื่อง่ายต่อการ Debug

export const ERROR_CODES = {
  // 🔐 Authentication Errors (AUTH_xxx)
  AUTH_INVALID_CREDENTIALS: {
    code: "AUTH_001",
    message: "Email หรือ Password ไม่ถูกต้อง",
    statusCode: 401,
  },
  AUTH_USER_NOT_FOUND: {
    code: "AUTH_002",
    message: "ไม่พบผู้ใช้ในระบบ",
    statusCode: 404,
  },
  AUTH_EMAIL_EXISTS: {
    code: "AUTH_003",
    message: "อีเมลนี้ถูกใช้งานแล้ว",
    statusCode: 400,
  },
  AUTH_INVALID_TOKEN: {
    code: "AUTH_004",
    message: "Token ไม่ถูกต้องหรือหมดอายุ",
    statusCode: 401,
  },
  AUTH_NO_TOKEN: {
    code: "AUTH_005",
    message: "ไม่พบ Token กรุณา Login ใหม่",
    statusCode: 401,
  },
  AUTH_INVALID_ROLE: {
    code: "AUTH_006",
    message: "Role ไม่ถูกต้อง",
    statusCode: 400,
  },

  // 🚫 Authorization Errors (AUTHZ_xxx)
  AUTHZ_FORBIDDEN: {
    code: "AUTHZ_001",
    message: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
    statusCode: 403,
  },
  AUTHZ_ADMIN_ONLY: {
    code: "AUTHZ_002",
    message: "เฉพาะ Admin เท่านั้น",
    statusCode: 403,
  },
  AUTHZ_TEACHER_ONLY: {
    code: "AUTHZ_003",
    message: "เฉพาะ Teacher เท่านั้น",
    statusCode: 403,
  },
  AUTHZ_STUDENT_ONLY: {
    code: "AUTHZ_004",
    message: "เฉพาะ Student เท่านั้น",
    statusCode: 403,
  },

  // 📝 Validation Errors (VAL_xxx)
  VAL_MISSING_FIELDS: {
    code: "VAL_001",
    message: "กรุณากรอกข้อมูลให้ครบถ้วน",
    statusCode: 400,
  },
  VAL_INVALID_EMAIL: {
    code: "VAL_002",
    message: "รูปแบบอีเมลไม่ถูกต้อง",
    statusCode: 400,
  },
  VAL_INVALID_DATE: {
    code: "VAL_003",
    message: "วันที่ไม่ถูกต้อง",
    statusCode: 400,
  },
  VAL_INVALID_ID: {
    code: "VAL_004",
    message: "ID ไม่ถูกต้อง",
    statusCode: 400,
  },

  // 👥 User Errors (USER_xxx)
  USER_NOT_FOUND: {
    code: "USER_001",
    message: "ไม่พบผู้ใช้",
    statusCode: 404,
  },
  USER_ALREADY_EXISTS: {
    code: "USER_002",
    message: "ผู้ใช้นี้มีอยู่ในระบบแล้ว",
    statusCode: 400,
  },

  // 📚 Course Errors (COURSE_xxx)
  COURSE_NOT_FOUND: {
    code: "COURSE_001",
    message: "ไม่พบรายวิชา",
    statusCode: 404,
  },
  COURSE_ALREADY_EXISTS: {
    code: "COURSE_002",
    message: "รายวิชานี้มีอยู่ในระบบแล้ว",
    statusCode: 400,
  },
  COURSE_SECTION_NOT_FOUND: {
    code: "COURSE_003",
    message: "ไม่พบ Section",
    statusCode: 404,
  },
  COURSE_SECTION_FULL: {
    code: "COURSE_004",
    message: "Section นี้เต็มแล้ว",
    statusCode: 400,
  },

  // 📝 Enrollment Errors (ENROLL_xxx)
  ENROLL_NOT_FOUND: {
    code: "ENROLL_001",
    message: "ไม่พบการลงทะเบียน",
    statusCode: 404,
  },
  ENROLL_ALREADY_ENROLLED: {
    code: "ENROLL_002",
    message: "ลงทะเบียนวิชานี้แล้ว",
    statusCode: 400,
  },
  ENROLL_TIME_CONFLICT: {
    code: "ENROLL_003",
    message: "เวลาเรียนซ้ำซ้อน",
    statusCode: 400,
  },
  ENROLL_CREDIT_LIMIT: {
    code: "ENROLL_004",
    message: "เกินจำนวนหน่วยกิตที่กำหนด",
    statusCode: 400,
  },
  ENROLL_PERIOD_CLOSED: {
    code: "ENROLL_005",
    message: "ปิดระบบการลงทะเบียนแล้ว",
    statusCode: 400,
  },

  // 📋 Pattern Errors (PATTERN_xxx)
  PATTERN_NOT_FOUND: {
    code: "PATTERN_001",
    message: "ไม่พบ Pattern",
    statusCode: 404,
  },
  PATTERN_ALREADY_EXISTS: {
    code: "PATTERN_002",
    message: "Pattern นี้มีอยู่ในระบบแล้ว",
    statusCode: 400,
  },

  // 📄 Pattern Request Errors (PREQ_xxx)
  PREQ_NOT_FOUND: {
    code: "PREQ_001",
    message: "ไม่พบคำขอ Pattern",
    statusCode: 404,
  },
  PREQ_ALREADY_PROCESSED: {
    code: "PREQ_002",
    message: "คำขอนี้ถูกดำเนินการไปแล้ว",
    statusCode: 400,
  },
  PREQ_DUPLICATE: {
    code: "PREQ_003",
    message: "มีคำขอ Pattern แบบเดียวกันอยู่แล้ว",
    statusCode: 400,
  },

  // 📖 Curriculum Errors (CURR_xxx)
  CURR_NOT_FOUND: {
    code: "CURR_001",
    message: "ไม่พบหลักสูตร",
    statusCode: 404,
  },

  // 📅 Academic Year Errors (ACAD_xxx)
  ACAD_YEAR_NOT_FOUND: {
    code: "ACAD_001",
    message: "ไม่พบปีการศึกษา",
    statusCode: 404,
  },
  ACAD_YEAR_EXISTS: {
    code: "ACAD_002",
    message: "ปีการศึกษานี้มีอยู่ในระบบแล้ว",
    statusCode: 400,
  },
  ACAD_SEMESTER_NOT_FOUND: {
    code: "ACAD_003",
    message: "ไม่พบภาคเรียน",
    statusCode: 404,
  },
  ACAD_INVALID_DATE_RANGE: {
    code: "ACAD_004",
    message: "วันที่ไม่ถูกต้อง",
    statusCode: 400,
  },

  // 👔 Head of Major Errors (HOM_xxx)
  HOM_NOT_FOUND: {
    code: "HOM_001",
    message: "ไม่พบหัวหน้าสาขา",
    statusCode: 404,
  },
  HOM_ALREADY_EXISTS: {
    code: "HOM_002",
    message: "สาขานี้มีหัวหน้าอยู่แล้ว",
    statusCode: 400,
  },

  // 🔧 System Errors (SYS_xxx)
  SYS_DATABASE_ERROR: {
    code: "SYS_001",
    message: "เกิดข้อผิดพลาดกับฐานข้อมูล",
    statusCode: 500,
  },
  SYS_INTERNAL_ERROR: {
    code: "SYS_002",
    message: "เกิดข้อผิดพลาดภายในระบบ",
    statusCode: 500,
  },
  SYS_VALIDATION_ERROR: {
    code: "SYS_003",
    message: "ข้อมูลไม่ผ่านการตรวจสอบ",
    statusCode: 400,
  },
};

// Helper function สำหรับสร้าง Error Response
export const createErrorResponse = (errorCode, additionalData = {}) => {
  const error = ERROR_CODES[errorCode] || ERROR_CODES.SYS_INTERNAL_ERROR;
  
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...additionalData,
    },
  };
};

// Helper function สำหรับ Success Response
export const createSuccessResponse = (data, message = "สำเร็จ") => {
  return {
    success: true,
    message,
    data,
  };
};
