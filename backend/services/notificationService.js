import Notification from "../models/notificationModel.js";

// สร้าง notification
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// แจ้งเตือนจองสำเร็จ
export const notifyBookingCreated = async (userId, bookingData) => {
  return createNotification(
    userId,
    "booking_created",
    "🎉 จองสำเร็จ!",
    `จองช่อง ${bookingData.spotName} เรียบร้อยแล้ว กรุณา Check-in ภายใน 30 นาที`,
    { bookingId: bookingData.bookingId, spotName: bookingData.spotName }
  );
};

// แจ้งเตือนก่อนหมดเวลา check-in
export const notifyCheckInReminder = async (userId, bookingData, minutesLeft) => {
  return createNotification(
    userId,
    "booking_reminder",
    "⏰ เตือน: ใกล้หมดเวลา Check-in!",
    `เหลือเวลา ${minutesLeft} นาที สำหรับ Check-in ช่อง ${bookingData.spotName}`,
    { bookingId: bookingData.bookingId, minutesLeft }
  );
};

// แจ้งเตือนการจองถูกยกเลิก
export const notifyBookingCancelled = async (userId, bookingData, reason = "หมดเวลา Check-in") => {
  return createNotification(
    userId,
    "booking_cancelled",
    "❌ การจองถูกยกเลิก",
    `การจองช่อง ${bookingData.spotName} ถูกยกเลิก เนื่องจาก${reason}`,
    { bookingId: bookingData.bookingId, reason }
  );
};

// แจ้งเตือน Check-in สำเร็จ
export const notifyCheckInSuccess = async (userId, bookingData) => {
  return createNotification(
    userId,
    "checkin_success",
    "✅ Check-in สำเร็จ!",
    `เริ่มจอดรถที่ช่อง ${bookingData.spotName} แล้ว 3 ชม.แรกฟรี!`,
    { bookingId: bookingData.bookingId }
  );
};

// แจ้งเตือน Check-out และสรุปค่าใช้จ่าย
export const notifyCheckOutSuccess = async (userId, bookingData, paymentSummary) => {
  return createNotification(
    userId,
    "checkout_success",
    "🚗 Check-out สำเร็จ!",
    `จอดรถทั้งหมด ${paymentSummary.duration} • ค่าใช้จ่าย ${paymentSummary.total} บาท`,
    { 
      bookingId: bookingData.bookingId, 
      duration: paymentSummary.duration,
      bookingFee: paymentSummary.bookingFee,
      overtimeFee: paymentSummary.overtimeFee,
      total: paymentSummary.total
    }
  );
};

// แจ้งเตือนโปรโมชั่นใหม่
export const notifyNewPromo = async (userId, promoData) => {
  return createNotification(
    userId,
    "promo_new",
    "🎁 โปรโมชั่นใหม่!",
    promoData.description,
    { promoCode: promoData.code, discount: promoData.discount }
  );
};

// แจ้งเตือนอัพเกรด Rank
export const notifyRankUpgrade = async (userId, newRank, benefits) => {
  return createNotification(
    userId,
    "rank_upgrade",
    `⭐ ยินดีด้วย! คุณได้รับ Rank ${newRank}`,
    `คุณได้รับสิทธิพิเศษ: ${benefits}`,
    { newRank, benefits }
  );
};

// แจ้งเตือนประกาศจากระบบ
export const notifySystemAnnouncement = async (userId, title, message) => {
  return createNotification(
    userId,
    "system_announcement",
    `📢 ${title}`,
    message,
    {}
  );
};

export default {
  createNotification,
  notifyBookingCreated,
  notifyCheckInReminder,
  notifyBookingCancelled,
  notifyCheckInSuccess,
  notifyCheckOutSuccess,
  notifyNewPromo,
  notifyRankUpgrade,
  notifySystemAnnouncement,
};
