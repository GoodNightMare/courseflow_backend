// models/RegistrationPeriod.js
import mongoose from "mongoose";

const registrationPeriodSchema = new mongoose.Schema({
  periodName: { type: String, required: true }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false }, 
}, { timestamps: true }); 

export default mongoose.model("RegistrationPeriod", registrationPeriodSchema);
