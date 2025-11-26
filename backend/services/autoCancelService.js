import cron from 'node-cron';
import Booking from '../models/bookingModel.js';
import ParkingSpot from '../models/parkingSpotModel.js';
import User from '../models/userModel.js';

/**
 * Auto-Cancel Reservation Service
 * 
 * ยกเลิกการจองอัตโนมัติหากผู้ใช้ไม่เข้ามา check-in ภายในเวลาที่กำหนด
 * - Grace Period: 30 นาที (ตาม Requirements)
 * - Check Interval: ทุก 5 นาที
 * - Status: pending -> cancelled
 * - Spot Status: occupied -> available
 * - ค่าจอง 20 บาทไม่คืน
 */

const GRACE_PERIOD_MINUTES = 30; // 30 นาทีหลังจอง (ตาม Requirements)
const CHECK_INTERVAL = '*/5 * * * *'; // ทุก 5 นาที

/**
 * ฟังก์ชันยกเลิกการจองที่หมดเวลา
 */
export const autoCancelExpiredBookings = async () => {
  try {
    const now = new Date();

    console.log(`[AutoCancel] Checking for expired bookings... (Timeout: ${GRACE_PERIOD_MINUTES} min)`);

    // หาการจองที่ pending และเกินเวลา check-in deadline แล้ว
    const expiredBookings = await Booking.find({
      status: 'pending',
      checkInDeadline: { $lt: now }, // เกิน deadline
      isCheckedIn: false // ยังไม่ check-in
    }).populate('user', 'name email username')
      .populate('spot', 'spotNumber name');

    if (expiredBookings.length === 0) {
      console.log('[AutoCancel] No expired bookings found.');
      return { cancelled: 0 };
    }

    console.log(`[AutoCancel] Found ${expiredBookings.length} expired bookings.`);

    let cancelledCount = 0;
    const errors = [];

    // ยกเลิกแต่ละการจอง
    for (const booking of expiredBookings) {
      try {
        // Update booking status
        booking.status = 'cancelled';
        booking.endTime = now;
        booking.cancelReason = 'auto_cancelled_timeout';
        booking.refundable = false; // ค่าจอง 20 บาทไม่คืน
        await booking.save();

        // Free up the parking spot
        await ParkingSpot.findByIdAndUpdate(
          booking.spot._id,
          { status: 'available' }
        );

        cancelledCount++;

        console.log(
          `[AutoCancel] ✓ Cancelled booking ${booking._id} ` +
          `(User: ${booking.user?.username}, Spot: ${booking.spot?.spotNumber}, Fee: ${booking.bookingFee} THB - NOT REFUNDED)`
        );

        // TODO: Send notification to user (email/push)
        // await sendCancellationNotification(booking);

      } catch (error) {
        console.error(`[AutoCancel] ✗ Error cancelling booking ${booking._id}:`, error.message);
        errors.push({
          bookingId: booking._id,
          error: error.message
        });
      }
    }

    const result = {
      timestamp: now.toISOString(),
      checked: expiredBookings.length,
      cancelled: cancelledCount,
      failed: errors.length,
      errors: errors
    };

    console.log(
      `[AutoCancel] Completed: ${cancelledCount}/${expiredBookings.length} cancelled successfully.`
    );

    return result;

  } catch (error) {
    console.error('[AutoCancel] Fatal error in auto-cancel service:', error);
    throw error;
  }
};

/**
 * เริ่มต้น Auto-Cancel Scheduler
 */
export const startAutoCancelScheduler = () => {
  console.log('=================================');
  console.log('🚀 Starting Auto-Cancel Scheduler');
  console.log('=================================');
  console.log(`⏱️  Grace Period: ${GRACE_PERIOD_MINUTES} minutes`);
  console.log(`� Booking Fee: 20 THB (non-refundable)`);
  console.log(`�🔄 Check Interval: Every 5 minutes`);
  console.log('=================================');

  // ตั้ง cron job ให้ทำงานทุก 5 นาที
  cron.schedule(CHECK_INTERVAL, async () => {
    console.log('\n--- Auto-Cancel Task Started ---');
    try {
      await autoCancelExpiredBookings();
    } catch (error) {
      console.error('[AutoCancel] Scheduler error:', error);
    }
    console.log('--- Auto-Cancel Task Completed ---\n');
  });

  console.log('✅ Auto-Cancel Scheduler is running!');
  console.log(`📅 Next run: Every 5 minutes\n`);

  // Run once on startup
  setTimeout(async () => {
    console.log('[AutoCancel] Running initial check...');
    await autoCancelExpiredBookings();
  }, 5000); // Wait 5 seconds after server start
};

/**
 * หยุด Auto-Cancel Scheduler (สำหรับ graceful shutdown)
 */
export const stopAutoCancelScheduler = () => {
  console.log('[AutoCancel] Stopping scheduler...');
  cron.getTasks().forEach(task => task.stop());
  console.log('[AutoCancel] Scheduler stopped.');
};

export default {
  startAutoCancelScheduler,
  stopAutoCancelScheduler,
  autoCancelExpiredBookings
};
