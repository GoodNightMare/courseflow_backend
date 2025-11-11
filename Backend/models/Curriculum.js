import mongoose from "mongoose";

const yearSemesterSchema = new mongoose.Schema({
  year: { type: Number, required: true },      
  semester: { type: Number, required: true },   
  courses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" } 
  ]    
});

const curriculumSchema = new mongoose.Schema({
  faculty: { type: String, required: true }, 
  major: { type: String, required: true },
  plan: [yearSemesterSchema],  
  totalCredits: { type: Number, default: 0 } 
});


export default mongoose.model("Curriculum", curriculumSchema);
