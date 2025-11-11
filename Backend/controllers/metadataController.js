import HeadOfMajor from "../models/HeadOfMajor.js";

// ✅ ดึงรายการคณะทั้งหมด
export const getFaculties = async (req, res) => {
  try {
    const faculties = await HeadOfMajor.distinct("faculty");
    res.json(faculties.sort());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ✅ ดึงรายการสาขาทั้งหมด (หรือตามคณะ)
export const getMajors = async (req, res) => {
  try {
    const { faculty } = req.query;
    const filter = faculty ? { faculty } : {};
    const majors = await HeadOfMajor.distinct("major", filter);
    res.json(majors.sort());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
