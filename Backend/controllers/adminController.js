// controllers/adminController.js
import { User } from "../models/Users.js";
import RegistrationPeriod from "../models/RegistrationPeriod.js";

// GET /api/users?role=student|teacher|admin → ดู user ตาม role
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
    if (role && ["student", "teacher", "admin"].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("teacher_id", "name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id → ดูข้อมูล user รายคน
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/:id → แก้ไข user
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    // ห้ามแก้ password ตรงนี้ ให้ใช้ endpoint แยกสำหรับ reset password
    delete updates.password;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id → ลบ user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ดึงวันเปิดปิดปัจจุบัน
export const getRegistrationPeriod = async (req, res) => {
  try {
    const period = await RegistrationPeriod.findOne();
    res.json(period);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const setRegistrationPeriod = async (req, res) => {
  try {
    const { periodName, startDate, endDate, isActive } = req.body;

    // ตรวจสอบข้อมูลที่ส่งมาครบไหม
    if (!periodName || !startDate || !endDate) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // หาข้อมูลรอบลงทะเบียนเดิม (มีได้แค่ 1 รายการ)
    let period = await RegistrationPeriod.findOne();

    if (!period) {
      // ยังไม่มี → สร้างใหม่
      period = new RegistrationPeriod({
        periodName,
        startDate,
        endDate,
        isActive: !!isActive, // แปลงให้แน่ใจว่าเป็น boolean
      });
    } else {
      // มีอยู่แล้ว → อัปเดต
      period.periodName = periodName;
      period.startDate = startDate;
      period.endDate = endDate;
      period.isActive = !!isActive;
    }

    await period.save();

    res.json({
      message: "บันทึกรอบลงทะเบียนสำเร็จ",
      period,
    });
  } catch (err) {
    console.error("Error saving registration period:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์" });
  }
};
