import HeadOfMajor from "../models/HeadOfMajor.js";

// ✅ เพิ่มหัวหน้าสาขาใหม่
export const createHeadOfMajor = async (req, res) => {
  try {
    const { faculty, major, teacher } = req.body;

    // ตรวจสอบซ้ำ
    const exists = await HeadOfMajor.findOne({ faculty, major });
    if (exists) {
      return res.status(400).json({ message: "สาขานี้มีหัวหน้าอยู่แล้ว" });
    }

    const newHead = new HeadOfMajor({ faculty, major, teacher });
    await newHead.save();

    res.status(201).json(newHead);
  } catch (error) {
    res.status(500).json({ message: "บันทึกไม่สำเร็จ", error });
  }
};

// ✅ ดึงข้อมูลทั้งหมด
export const getAllHeads = async (req, res) => {
  try {
    const heads = await HeadOfMajor.find().populate("teacher");
    res.json(heads);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error });
  }
};

// ✅ ดึงข้อมูลตาม faculty และ major
export const getByFacultyAndMajor = async (req, res) => {
  try {
    const { faculty, major } = req.params;
    const head = await HeadOfMajor.findOne({ faculty, major }).populate("teacher");

    if (!head) {
      return res.status(404).json({ message: "ไม่พบหัวหน้าสาขานี้" });
    }

    res.json(head);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};