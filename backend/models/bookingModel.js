import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null,
  },
  spot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingSpot",
    required: true,
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingZone",
    default: null,
  },
  floor: {
    type: String,
    default: "ชั้น 1",
  },
  startTime: {
    type: Date,
    required: true,
  },
  actualStartTime: {
    type: Date,
    default: null, // เวลา check-in จริง
  },
  endTime: {  
    type: Date,
    default: null,
  },
  actualEndTime: {
    type: Date,
    default: null, // เวลา check-out จริง
  },
  bookingFee: {
    type: Number,
    default: 20, // ค่าธรรมเนียมการจอง 20 บาท/ครั้ง
  },
  cost: {
    type: Number,
    default: 0, // ค่าจอดเกิน (10 บาท/ชม. หลัง 3 ชม.แรก)
  },
  totalCost: {
    type: Number,
    default: 0, // bookingFee + cost
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  isCheckedIn: {
    type: Boolean,
    default: false, // ยืนยันว่ามาถึงที่จอดแล้ว
  },
  checkInDeadline: {
    type: Date,
    default: null, // ต้อง check-in ภายในเวลานี้ (30 นาทีหลังจอง)
  },
  cancelReason: {
    type: String,
    enum: ["user_cancelled", "auto_cancelled_timeout", "admin_cancelled"],
    default: null,
  },
  refundable: {
    type: Boolean,
    default: false, // ค่าจอง 20 บาทไม่คืน
  },
}, { timestamps: true });

// Indexes for faster queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ spot: 1 });
bookingSchema.index({ startTime: -1 });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;