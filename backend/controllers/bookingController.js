import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import ParkingSpot from "../models/parkingSpotModel.js";
import ParkingZone from "../models/parkingZoneModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import { generateBookingQRCode } from "../services/qrCodeService.js";
import { 
  notifyBookingCreated, 
  notifyCheckInSuccess, 
  notifyCheckOutSuccess,
  notifyBookingCancelled 
} from "../services/notificationService.js";

/*
    @desc   Create a new booking
    @route  POST /api/bookings
    @access Private
*/
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { spotId, zoneId, vehicleId, floor } = req.body;
    const userId = req.userId;

    // Get user data
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    // Check for existing active booking (pending หรือ confirmed)
    const existingBooking = await Booking.findOne({
      user: userId,
      status: { $in: ["pending", "confirmed"] },
    }).session(session);

    if (existingBooking) {
      throw new Error("คุณมีการจองที่ใช้งานอยู่แล้ว กรุณาปิดการจองก่อนทำรายการใหม่");
    }

    let spot = null;

    // If spotId is provided, try to find the spot directly
    if (spotId) {
      spot = await ParkingSpot.findById(spotId)
        .populate("zone")
        .session(session);
      
      // If not found by ID, maybe it's a zone ID - find an available spot
      if (!spot) {
        const zone = await ParkingZone.findById(spotId).session(session);
        if (zone) {
          // Find an available spot in this zone
          const query = { zone: zone._id, status: "available" };
          if (floor) query.floor = floor;
          
          spot = await ParkingSpot.findOne(query)
            .populate("zone")
            .session(session);
        }
      }
    }
    
    // If zoneId is provided instead, find an available spot in that zone
    if (!spot && zoneId) {
      const query = { zone: zoneId, status: "available" };
      if (floor) query.floor = floor;
      
      spot = await ParkingSpot.findOne(query)
        .populate("zone")
        .session(session);
    }

    if (!spot) {
      throw new Error("ไม่พบช่องจอดรถที่ว่าง กรุณาลองโซนอื่น");
    }

    if (spot.status !== "available") {
      throw new Error("ช่องจอดรถนี้ไม่ว่างในขณะนี้");
    }

    // Get vehicle if provided
    let vehicle = null;
    if (vehicleId) {
      vehicle = await Vehicle.findOne({
        _id: vehicleId,
        userId: userId,
      }).session(session);

      if (!vehicle) {
        throw new Error("ไม่พบข้อมูลรถยนต์");
      }
    }

    // Update spot status to occupied
    spot.status = "occupied";
    await spot.save({ session });

    // Create new booking with booking fee (ตาม Requirements: 20 บาท/ครั้ง)
    const bookingFee = 20; // ค่าธรรมเนียมการจอง 20 บาท/ครั้ง
    const checkInDeadline = new Date(Date.now() + 30 * 60 * 1000); // 30 นาทีต้องมาถึง
    
    const newBooking = new Booking({
      user: userId,
      vehicle: vehicleId || null,
      spot: spot._id, // ใช้ spot._id เสมอ (ไม่ใช่ spotId ที่อาจเป็น Zone ID)
      zone: spot.zone._id,
      zoneName: spot.zone.zoneName,
      floor: spot.floor,
      startTime: new Date(),
      status: "pending", // สถานะรอ check-in
      bookingFee: bookingFee, // ค่าจอง 20 บาท
      cost: 0, // ค่าจอดเกิน (จะคำนวณเมื่อจบการจอด)
      isCheckedIn: false,
      checkInDeadline: checkInDeadline, // ต้อง check-in ภายใน 30 นาที
      refundable: false, // ค่าจอง 20 บาทไม่คืน
    });

    await newBooking.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Generate QR code for the booking
    let qrCodeData = null;
    try {
      const qrCode = await generateBookingQRCode(newBooking);
      qrCodeData = {
        qrCodeURL: qrCode.qrCodeDataURL,
        expiresAt: qrCode.expiresAt
      };
    } catch (qrError) {
      console.error('QR Code generation failed:', qrError);
      // Continue without QR code - non-critical feature
    }

    // Prepare response
    const responseData = {
      bookingId: newBooking._id,
      spot: {
        id: spot._id,
        spotNumber: spot.spotNumber,
        name: spot.name,
        floor: spot.floor,
        building: spot.building,
      },
      zone: {
        id: spot.zone._id,
        name: spot.zone.zoneName,
        building: spot.zone.building,
      },
      vehicle: vehicle
        ? {
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
          }
        : null,
      startTime: newBooking.startTime,
      status: newBooking.status,
      pricing: {
        bookingFee: bookingFee, // ค่าธรรมเนียมการจอง 20 บาท/ครั้ง
        freeHours: 3, // 3 ชั่วโมงแรกฟรี
        overtimeRate: 10, // 10 บาท/ชั่วโมง (หลัง 3 ชม.แรก)
      },
      checkInDeadline: checkInDeadline, // ต้อง check-in ภายในเวลานี้
      qrCode: qrCodeData, // QR code for check-in
      warning: "⚠️ ต้องสแกน QR Code เพื่อยืนยันมาถึงภายใน 30 นาที ไม่งั้นระบบจะยกเลิกการจองอัตโนมัติ (ค่าจอง 20 บาทไม่คืน)",
    };

    // ส่ง notification แจ้งเตือนจองสำเร็จ
    try {
      await notifyBookingCreated(userId, {
        bookingId: newBooking._id,
        spotName: spot.spotNumber || spot.name,
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
      // ไม่ block response ถ้า notification ล้มเหลว
    }

    res.status(201).json({
      success: true,
      message: "สร้างการจองสำเร็จ",
      data: responseData,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create booking error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "ไม่สามารถสร้างการจองได้",
    });
  } finally {
    session.endSession();
  }
};

/*
    @desc   Get active booking for current user
    @route  GET /api/bookings/active
    @access Private
*/
export const getActiveBooking = async (req, res) => {
  try {
    const userId = req.userId;

    // ค้นหาทั้ง pending และ confirmed
    const booking = await Booking.findOne({
      user: userId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate({
        path: "spot",
        select: "spotNumber name floor building pricePerHour facilities",
        populate: {
          path: "zone",
          select: "zoneName name building",
        },
      })
      .populate("vehicle", "licensePlate brand model");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการจองที่ใช้งานอยู่",
      });
    }

    // Calculate current duration and estimated cost
    const now = new Date();
    
    // ถ้า pending: นับเวลาที่เหลือในการ check-in
    // ถ้า confirmed: นับเวลาจอด (เริ่มจาก actualStartTime)
    let durationMs, durationHours;
    let timeRemainingToCheckIn = null;
    
    if (booking.status === 'pending') {
      // คำนวณเวลาที่เหลือในการ check-in
      const remainingMs = booking.checkInDeadline - now;
      timeRemainingToCheckIn = {
        minutes: Math.max(0, Math.floor(remainingMs / 60000)),
        seconds: Math.max(0, Math.floor((remainingMs % 60000) / 1000)),
        expired: remainingMs <= 0
      };
      durationMs = 0;
      durationHours = 0;
    } else {
      // confirmed - นับเวลาจอดจริง
      const parkingStartTime = booking.actualStartTime || booking.startTime;
      durationMs = now - parkingStartTime;
      durationHours = durationMs / (1000 * 60 * 60);
    }

    const user = await User.findById(userId);

    // Apply rank discount
    let discount = 0;
    if (user.rank === "Diamond") {
      discount = 0.1; // 10%
    } else if (user.rank === "Predator") {
      discount = 0.2; // 20%
    }

    // 3 ชม.แรกฟรี หลังจากนั้น 10 บาท/ชม.
    const freeHours = 3;
    const overtimeRate = 10;
    const chargeableHours = Math.max(0, durationHours - freeHours);
    const estimatedOvertimeCost = Math.ceil(chargeableHours) * overtimeRate * (1 - discount);
    const estimatedTotalCost = booking.bookingFee + estimatedOvertimeCost;

    const responseData = {
      bookingId: booking._id,
      spot: {
        spotNumber: booking.spot?.spotNumber || "N/A",
        name: booking.spot?.name || "N/A",
        floor: booking.floor || booking.spot?.floor || "N/A",
        building: booking.spot?.building || "N/A",
        facilities: booking.spot?.facilities || [],
      },
      zone: {
        name: booking.spot?.zone?.zoneName || booking.zoneName || "N/A",
        building: booking.spot?.zone?.building || "N/A",
      },
      vehicle: booking.vehicle
        ? {
            licensePlate: booking.vehicle.licensePlate,
            brand: booking.vehicle.brand,
            model: booking.vehicle.model,
          }
        : null,
      startTime: booking.startTime,
      actualStartTime: booking.actualStartTime,
      checkInDeadline: booking.checkInDeadline,
      isCheckedIn: booking.isCheckedIn,
      timeRemainingToCheckIn: timeRemainingToCheckIn,
      duration: {
        hours: Math.floor(durationHours),
        minutes: Math.floor((durationHours % 1) * 60),
      },
      pricing: {
        bookingFee: booking.bookingFee,
        freeHours: freeHours,
        overtimeRate: overtimeRate,
        chargeableHours: chargeableHours.toFixed(2),
        discount: Math.round(discount * 100),
        estimatedOvertimeCost: estimatedOvertimeCost,
        estimatedTotalCost: estimatedTotalCost,
      },
      status: booking.status,
      qrCode: booking.qrCode || null,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get active booking error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

/*
    @desc   Complete/End a booking
    @route  PUT /api/bookings/:id/complete
    @access Private
*/
export const completeBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({
      _id: id,
      user: userId,
      status: "confirmed", // ต้อง check-in แล้ว
    })
      .populate("spot")
      .session(session);

    if (!booking) {
      throw new Error("ไม่พบการจองที่ใช้งานอยู่ หรือยังไม่ได้ check-in");
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("ไม่พบข้อมูลผู้ใช้");
    }

    // Calculate cost - นับจากเวลา check-in จริง
    const endTime = new Date();
    const parkingStartTime = booking.actualStartTime || booking.startTime;
    const durationMs = endTime - parkingStartTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Apply membership tier discount (ตาม Requirements)
    let discount = 0;
    let pointsEarned = 0;

    if (user.memberTier === "diamond" || user.rank === "Diamond") {
      discount = 0.1; // 10% ส่วนลด
      pointsEarned = Math.floor(durationHours * 5); // 5 points per hour
    } else if (user.memberTier === "predator" || user.rank === "Predator") {
      discount = 0.15; // 15% ส่วนลด (ตาม Requirements)
      pointsEarned = Math.floor(durationHours * 10); // 10 points per hour
    } else {
      // Iron tier - ไม่มีส่วนลด
      discount = 0;
      pointsEarned = Math.floor(durationHours * 2); // 2 points per hour for Iron
    }

    // First 3 hours free (ตาม Requirements)
    const freeHours = 3;
    const chargeableHours = Math.max(0, durationHours - freeHours);
    
    // คำนวณค่าจอดเกิน (10 บาท/ชม. หลัง 3 ชม.แรก)
    const overtimeCost = Math.ceil(chargeableHours) * 10 * (1 - discount);
    
    // ค่าธรรมเนียมการจอง (20 บาท/ครั้ง)
    const bookingFee = booking.bookingFee || 20;
    
    // รวมค่าใช้จ่ายทั้งหมด
    const totalCost = bookingFee + overtimeCost;

    // Update booking
    booking.endTime = endTime;
    booking.cost = overtimeCost; // ค่าจอดเกิน
    booking.totalCost = totalCost; // ค่าใช้จ่ายรวม
    booking.status = "completed";
    await booking.save({ session });

    // Free up the parking spot
    if (booking.spot) {
      booking.spot.status = "available";
      await booking.spot.save({ session });
    }

    // Award points to user
    user.points += pointsEarned;
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "ปิดการจองสำเร็จ",
      data: {
        bookingId: booking._id,
        duration: {
          hours: Math.floor(durationHours),
          minutes: Math.floor((durationHours % 1) * 60),
        },
        pricing: {
          bookingFee: bookingFee, // 20 บาท
          overtimeCost: overtimeCost, // ค่าจอดเกิน (10฿/ชม.)
          totalCost: totalCost, // รวมทั้งหมด
          freeHours: freeHours, // 3 ชั่วโมงฟรี
          chargeableHours: chargeableHours, // ชั่วโมงที่คิดเงิน
        },
        pointsEarned,
        totalPoints: user.points,
        discount: Math.round(discount * 100) + '%',
        memberTier: user.memberTier || user.rank,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Complete booking error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "ไม่สามารถปิดการจองได้",
    });
  } finally {
    session.endSession();
  }
};

/*
    @desc   Cancel a booking
    @route  DELETE /api/bookings/:id
    @access Private
*/
export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.userId;

    // ค้นหาการจองที่ pending หรือ confirmed
    const booking = await Booking.findOne({
      _id: id,
      user: userId,
      status: { $in: ["pending", "confirmed"] },
    })
      .populate("spot")
      .session(session);

    if (!booking) {
      throw new Error("ไม่พบการจองที่สามารถยกเลิกได้");
    }

    // Update booking status
    booking.status = "cancelled";
    booking.cancelReason = "user_cancelled";
    booking.endTime = new Date();
    booking.refundable = false; // ค่าจอง 20 บาทไม่คืน
    await booking.save({ session });

    // Free up the parking spot
    if (booking.spot) {
      booking.spot.status = "available";
      await booking.spot.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "ยกเลิกการจองสำเร็จ (ค่าธรรมเนียมการจอง 20 บาทไม่คืน)",
      data: {
        bookingId: booking._id,
        bookingFee: booking.bookingFee,
        refundable: false,
        note: "ค่าธรรมเนียมการจอง 20 บาทไม่สามารถคืนได้"
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Cancel booking error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "ไม่สามารถยกเลิกการจองได้",
    });
  } finally {
    session.endSession();
  }
};

/*
    @desc   Get booking history
    @route  GET /api/bookings/history
    @access Private
*/
export const getBookingHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: "spot",
        select: "spotNumber name floor building",
        populate: {
          path: "zone",
          select: "zoneName name building",
        },
      })
      .populate("vehicle", "licensePlate brand model")
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    const formattedBookings = bookings.map((booking) => {
      const durationMs = booking.endTime
        ? booking.endTime - booking.startTime
        : new Date() - booking.startTime;
      const durationHours = durationMs / (1000 * 60 * 60);

      return {
        id: booking._id,
        spot: {
          spotNumber: booking.spot?.spotNumber || "N/A",
          name: booking.spot?.name || "N/A",
          floor: booking.floor || booking.spot?.floor || "N/A",
          building: booking.spot?.building || "N/A",
        },
        zone: {
          name: booking.spot?.zone?.zoneName || booking.zoneName || "N/A",
          building: booking.spot?.zone?.building || "N/A",
        },
        vehicle: booking.vehicle
          ? {
              licensePlate: booking.vehicle.licensePlate,
              brand: booking.vehicle.brand,
              model: booking.vehicle.model,
            }
          : null,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: {
          hours: Math.floor(durationHours),
          minutes: Math.floor((durationHours % 1) * 60),
        },
        cost: booking.cost || 0,
        status: booking.status,
      };
    });

    res.status(200).json({
      success: true,
      bookings: formattedBookings,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalBookings: count,
      },
    });
  } catch (error) {
    console.error("Get booking history error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

/*
    @desc   Update booking status (admin function - keeping for compatibility)
    @route  PUT /api/bookings/update
    @access Private
*/
export const updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  const validStatuses = ["active", "completed", "cancelled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `สถานะไม่ถูกต้อง ต้องเป็น: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการจอง",
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `อัปเดตสถานะเป็น ${status} สำเร็จ`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      error: error.message,
    });
  }
};

/*
    @desc   Check-in to booking (confirm arrival via QR scan)
    @route  PUT /api/bookings/:bookingId/checkin
    @access Private
*/
export const checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('spot', 'spotNumber name floor building')
      .populate('zone', 'zoneName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบการจอง"
      });
    }

    // Verify ownership
    if (booking.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "คุณไม่มีสิทธิ์เข้าถึงการจองนี้"
      });
    }

    // Check status - ต้องเป็น pending เท่านั้น
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: booking.status === 'confirmed' 
          ? "คุณได้ทำการ check-in แล้ว" 
          : `การจองนี้อยู่ในสถานะ ${booking.status}`
      });
    }

    // Check if deadline passed (30 นาที)
    const now = new Date();
    if (now > booking.checkInDeadline) {
      // ยกเลิกการจองอัตโนมัติ
      booking.status = 'cancelled';
      booking.cancelReason = 'auto_cancelled_timeout';
      booking.endTime = now;
      await booking.save();
      
      // Free up spot
      await ParkingSpot.findByIdAndUpdate(booking.spot._id, { status: 'available' });
      
      return res.status(400).json({
        success: false,
        message: "หมดเวลา check-in แล้ว การจองถูกยกเลิกอัตโนมัติ (ค่าจอง 20 บาทไม่คืน)",
        bookingFee: booking.bookingFee,
        refundable: false
      });
    }

    // Update to confirmed status
    booking.status = 'confirmed';
    booking.isCheckedIn = true;
    booking.actualStartTime = now; // เริ่มนับเวลาจอดจากตรงนี้
    await booking.save();

    // ส่ง notification แจ้งเตือน check-in สำเร็จ
    try {
      await notifyCheckInSuccess(booking.user, {
        bookingId: booking._id,
        spotName: booking.spot?.spotNumber || booking.spot?.name || 'N/A',
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    res.status(200).json({
      success: true,
      message: "✅ Check-in สำเร็จ! ยินดีต้อนรับสู่ที่จอดรถ",
      data: {
        bookingId: booking._id,
        checkedInAt: booking.actualStartTime,
        spot: booking.spot,
        zone: booking.zone,
        pricing: {
          bookingFee: booking.bookingFee,
          freeHours: 3,
          overtimeRate: 10,
          note: "3 ชม.แรกฟรี หลังจากนั้น 10 บาท/ชม."
        }
      }
    });

  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการ check-in",
      error: error.message
    });
  }
};

/*
    @desc   Check-out from booking
    @route  PUT /api/bookings/:bookingId/checkout
    @access Private
*/
export const checkOut = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findById(bookingId)
      .populate('spot')
      .populate('user', 'rank')
      .session(session);

    if (!booking) {
      throw new Error("ไม่พบการจอง");
    }

    // Verify ownership
    if (booking.user._id.toString() !== userId) {
      throw new Error("คุณไม่มีสิทธิ์เข้าถึงการจองนี้");
    }

    // Check status - ต้อง confirmed เท่านั้น
    if (booking.status !== 'confirmed') {
      throw new Error(booking.status === 'pending' 
        ? "กรุณา check-in ก่อน check-out" 
        : `การจองนี้อยู่ในสถานะ ${booking.status}`);
    }

    // Calculate duration and costs
    const now = new Date();
    booking.actualEndTime = now;
    booking.endTime = now;

    const durationMs = now - booking.actualStartTime;
    const durationHours = durationMs / (1000 * 60 * 60);

    // Pricing calculation - 3 ชม.แรกฟรี หลังจากนั้น 10 บาท/ชม.
    const freeHours = 3;
    const overtimeRate = 10; // บาท/ชั่วโมง
    const overtimeHours = Math.max(0, durationHours - freeHours);
    const overtimeCost = Math.ceil(overtimeHours) * overtimeRate;

    // Apply membership discounts
    let discount = 0;
    if (booking.user.rank === 'Diamond') {
      discount = 0.10; // 10% off
    } else if (booking.user.rank === 'Predator') {
      discount = 0.20; // 20% off
    }

    const discountAmount = overtimeCost * discount;
    const finalOvertimeCost = overtimeCost - discountAmount;

    booking.cost = finalOvertimeCost;
    booking.totalCost = booking.bookingFee + finalOvertimeCost;
    booking.status = 'completed';

    await booking.save({ session });

    // Free up the spot
    await ParkingSpot.findByIdAndUpdate(
      booking.spot._id,
      { status: 'available' },
      { session }
    );

    await session.commitTransaction();

    // ส่ง notification แจ้งเตือน check-out สำเร็จ
    try {
      const durationText = `${Math.floor(durationHours)} ชม. ${Math.floor((durationHours % 1) * 60)} นาที`;
      await notifyCheckOutSuccess(booking.user._id || booking.user, {
        bookingId: booking._id,
      }, {
        duration: durationText,
        bookingFee: booking.bookingFee,
        overtimeFee: booking.cost,
        total: booking.totalCost,
      });
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

    res.status(200).json({
      success: true,
      message: "Check-out สำเร็จ! ขอบคุณที่ใช้บริการ",
      data: {
        bookingId: booking._id,
        duration: {
          hours: Math.floor(durationHours),
          minutes: Math.floor((durationHours % 1) * 60)
        },
        pricing: {
          bookingFee: booking.bookingFee,
          durationHours: durationHours.toFixed(2),
          freeHours: freeHours,
          overtimeHours: overtimeHours.toFixed(2),
          overtimeCost: overtimeCost,
          membershipDiscount: discount * 100 + '%',
          discountAmount: discountAmount.toFixed(2),
          finalCost: booking.cost.toFixed(2),
          totalCost: booking.totalCost
        },
        checkedIn: booking.actualStartTime,
        checkedOut: booking.actualEndTime
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "เกิดข้อผิดพลาดในการ check-out",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};
