import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import PromoCode from "../models/promoCodeModel.js";

// Get all tiers and user subscription
export const getTiers = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "ไม่พบผู้ใช้" 
      });
    }

    // Get active subscription
    const subscription = await Subscription.findOne({
      user: userId,
      status: "active",
      expiresAt: { $gt: new Date() }
    });

    // Define tiers
    const tiers = [
      {
        id: "iron",
        name: "Iron",
        price: 0,
        discount: 0,
        features: [
          "จองได้ทุกโซน",
          "ประวัติการจอง 7 วัน",
          "แจ้งเตือนพื้นฐาน",
          "รองรับ 1 ยานพาหนะ"
        ]
      },
      {
        id: "diamond",
        name: "Diamond",
        price: 199,
        discount: 10,
        features: [
          "ส่วนลด 10% ทุกการจอง",
          "จองล่วงหน้า 7 วัน",
          "ประวัติการจอดไม่จำกัด",
          "แจ้งเตือนแบบ Real-time",
          "รองรับ 3 ยานพาหนะ",
          "จองช่องพิเศษ"
        ]
      },
      {
        id: "predator",
        name: "Predator",
        price: 399,
        discount: 15,
        features: [
          "ส่วนลด 15% ทุกการจอง",
          "จองล่วงหน้า 30 วัน",
          "ประวัติการจอดไม่จำกัด",
          "แจ้งเตือนแบบ Real-time",
          "รองรับยานพาหนะไม่จำกัด",
          "จองช่องพิเศษ & VIP",
          "ที่จอดแบบจองตลอด",
          "บริการช่วยเหลือ 24/7",
          "โอนสิทธิ์การจองได้"
        ]
      }
    ];

    res.json({
      success: true,
      tiers,
      currentTier: user.rank || "Iron",
      subscription: subscription || null,
      points: user.points || 0
    });

  } catch (error) {
    console.error("Get tiers error:", error);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาด" 
    });
  }
};

// Subscribe to tier
export const subscribe = async (req, res) => {
  try {
    const userId = req.userId;
    const { tierId, paymentMethod = "credit" } = req.body;

    if (!tierId) {
      return res.status(400).json({ 
        success: false, 
        message: "กรุณาระบุ tier" 
      });
    }

    if (tierId === "iron") {
      return res.status(400).json({ 
        success: false, 
        message: "Iron tier เป็นแผนฟรี ไม่ต้องสมัคร" 
      });
    }

    // Check existing subscription
    const existingSub = await Subscription.findOne({
      user: userId,
      status: "active",
      expiresAt: { $gt: new Date() }
    });

    if (existingSub && existingSub.tier === tierId) {
      return res.status(400).json({ 
        success: false, 
        message: "คุณกำลังใช้งาน tier นี้อยู่แล้ว" 
      });
    }

    // Create subscription
    const tierName = tierId === "diamond" ? "Diamond" : "Predator";
    const price = tierId === "diamond" ? 199 : 399;
    
    const subscription = new Subscription({
      user: userId,
      tier: tierId,
      tierName,
      price,
      paymentMethod,
      status: "active",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await subscription.save();

    // Update user rank
    await User.findByIdAndUpdate(userId, {
      rank: tierName,
      subscriptionExpiry: subscription.expiresAt
    });

    // Cancel old subscriptions
    if (existingSub) {
      await Subscription.findByIdAndUpdate(existingSub._id, {
        status: "cancelled"
      });
    }

    res.json({
      success: true,
      message: `สมัคร ${tierName} สำเร็จ!`,
      subscription
    });

  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาด" 
    });
  }
};

// Redeem promo code
export const redeemCode = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: "กรุณากรอกโค้ด" 
      });
    }

    // Find promo code
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!promoCode) {
      return res.status(404).json({ 
        success: false, 
        message: "โค้ดไม่ถูกต้องหรือหมดอายุแล้ว" 
      });
    }

    // Check usage limit
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ 
        success: false, 
        message: "โค้ดนี้ถูกใช้งานครบแล้ว" 
      });
    }

    // Check if user already used
    if (promoCode.usedBy.includes(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "คุณใช้โค้ดนี้ไปแล้ว" 
      });
    }

    // Apply code benefits
    if (promoCode.type === "subscription") {
      // Grant subscription
      const tierName = promoCode.tier === "diamond" ? "Diamond" : "Predator";
      
      const subscription = new Subscription({
        user: userId,
        tier: promoCode.tier,
        tierName,
        price: 0,
        paymentMethod: "promo_code",
        promoCode: code.toUpperCase(),
        status: "active",
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + (promoCode.durationDays || 30) * 24 * 60 * 60 * 1000)
      });

      await subscription.save();

      // Update user rank
      await User.findByIdAndUpdate(userId, {
        rank: tierName,
        subscriptionExpiry: subscription.expiresAt
      });

      // Mark code as used
      promoCode.usedCount += 1;
      promoCode.usedBy.push(userId);
      await promoCode.save();

      return res.json({
        success: true,
        message: `แลกโค้ดสำเร็จ! คุณได้รับ ${tierName} ${promoCode.durationDays || 30} วัน`,
        subscription
      });

    } else if (promoCode.type === "points") {
      // Grant points
      await User.findByIdAndUpdate(userId, {
        $inc: { points: promoCode.points || 100 }
      });

      // Mark code as used
      promoCode.usedCount += 1;
      promoCode.usedBy.push(userId);
      await promoCode.save();

      return res.json({
        success: true,
        message: `แลกโค้ดสำเร็จ! คุณได้รับ ${promoCode.points || 100} แต้ม`,
        points: promoCode.points || 100
      });
    }

    res.status(400).json({ 
      success: false, 
      message: "ประเภทโค้ดไม่ถูกต้อง" 
    });

  } catch (error) {
    console.error("Redeem code error:", error);
    res.status(500).json({ 
      success: false, 
      message: "เกิดข้อผิดพลาด" 
    });
  }
};
