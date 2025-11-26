import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import transporter from "../config/nodemailer.js";

// Register new user
const register = async (req, res) => {
  const { name, email, username, password, phone } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username: username || email }] 
    });
    
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ 
      name,
      email,
      username: username || email,
      password: hashedPassword,
      phone: phone || "",
      rank: "Iron",
      points: 0
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Send welcome email
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "ยินดีต้อนรับสู่ SciPark",
        text: `สวัสดี ${name},\n\nขอบคุณที่สมัครสมาชิก SciPark!\n\nคุณสามารถเริ่มจองที่จอดรถได้เลยตอนนี้\n\nทีมงาน SciPark`,
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Continue even if email fails
    }

    return res.status(201).json({ 
      success: true, 
      message: "สมัครสมาชิกสำเร็จ",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        rank: user.rank,
        points: user.points
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  const { email, username, password } = req.body;

  // Validate that email/username and password are provided
  if ((!email && !username) || !password) {
    return res
      .status(400)
      .json({ success: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  try {
    // Find user by email or username
    const user = await User.findOne({ 
      $or: [
        { email: email || username }, 
        { username: username || email }
      ] 
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(200).json({ 
      success: true, 
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        rank: user.rank,
        points: user.points,
        subscriptionExpiry: user.subscriptionExpiry
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาด", error: error.message });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "ออกจากระบบสำเร็จ" });
  } catch (error) {
    return res // Server error
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

// Send OTP for verification
const sendVerifyOTP = async (req, res) => {
  try {
    const userId = req.userId;

    // Validate that userId is provided
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized" });
    }

    // Find user by id
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User is already verified." });
    }

    // Delete any existing OTPs for this user to avoid multiple valid OTPs
    await OTP.deleteMany({ userId: user._id, type: "ACCOUNT_VERIFICATION" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newOTP = new OTP({
      userId: user._id,
      otp: otpCode, // ส่งรหัสตัวเลขดิบๆ ไป เดี๋ยว model จะ hash ให้เอง
      type: "ACCOUNT_VERIFICATION",
    });
    await newOTP.save();

    // Email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.username,
      subject: "Your Verification OTP",
      text: `Your OTP is ${otpCode}. It is valid for 10 minutes.`, // แจ้งเวลาที่ถูกต้อง
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    return res // Server error
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP are required." });
  }

  const userId = req.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid user.",
      });
    }

    // ค้นหา OTP จาก Collection `otps` ไม่ใช่จาก User
    const otpRecord = await OTP.findOne({
      userId: user._id,
      type: "ACCOUNT_VERIFICATION",
    });

    // ถ้าไม่เจอ OTP record แสดงว่า OTP หมดอายุ (ถูก TTL ลบไปแล้ว) หรือไม่เคยมี
    if (!otpRecord) {
        return res.json({
            success: false,
            message: "Invalid or expired OTP",
          });
    }

    // เปรียบเทียบ OTP ที่ส่งมากับ OTP ที่ hash ไว้ในฐานข้อมูล
    const isMatch = await bcrypt.compare(otp, otpRecord.otp);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // อัปเดตสถานะ User และลบ OTP ที่ใช้แล้วทิ้ง
    user.isAccountVerified = true;
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id }); // ลบทันทีหลังใช้งานสำเร็จ

    return res
      .status(200)
      .json({ success: true, message: "Account verified successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error.", error: error.message });
  }
};

export { register, login, logout, sendVerifyOTP, verifyEmail }; // Export the controller functions



