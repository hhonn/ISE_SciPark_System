import mongoose from "mongoose";
import dotenv from "dotenv";
import ParkingZone from "../models/parkingZoneModel.js";
import ParkingSpot from "../models/parkingSpotModel.js";
import PromoCode from "../models/promoCodeModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (รวมถึง users)
    await ParkingZone.deleteMany({});
    await ParkingSpot.deleteMany({});
    await PromoCode.deleteMany({});
    await User.deleteMany({}); // ลบ users ด้วยเพื่อให้สร้างใหม่ได้
    console.log("🗑️  Cleared existing data");

    // Create Parking Zones (ลานจอดรถทั้งหมด - ไม่มีชั้น)
    const zones = [
      {
        zoneName: "CHULA",
        name: "หน้าตึกจุฬาภรณวลัยลักษณ์ 1",
        description: "ลานจอดรถหน้าตึกจุฬาภรณวลัยลักษณ์ 1 ใกล้ทางเข้าหลัก",
        building: "ตึกจุฬาภรณวลัยลักษณ์ 1",
        totalSpots: 30,
        hourlyRate: 10,
        isOpenLot: true, // เป็นลานจอด ไม่มีชั้น
      },
      {
        zoneName: "PRAJOM",
        name: "ใต้ตึกพระจอมเกล้า",
        description: "ลานจอดรถใต้ตึกพระจอมเกล้า ชั้น G ป้องกันแดดฝน",
        building: "ตึกพระจอมเกล้า",
        totalSpots: 25,
        hourlyRate: 10,
        isOpenLot: true, // เป็นลานจอด ไม่มีชั้น (ชั้น G)
      },
      {
        zoneName: "BEHIND",
        name: "หลังคณะวิทยาศาสตร์",
        description: "ลานจอดรถด้านหลังคณะวิทยาศาสตร์ มีต้นไม้ร่มรื่น",
        building: "คณะวิทยาศาสตร์",
        totalSpots: 35,
        hourlyRate: 10,
        isOpenLot: true, // เป็นลานจอด ไม่มีชั้น
      },
      {
        zoneName: "DEAN",
        name: "หน้าตึกคณบดีคณะวิทยาศาสตร์",
        description: "ลานจอดรถหน้าตึกคณบดี สะดวกสบาย มีที่จอดเยอะ",
        building: "ตึกคณบดีคณะวิทยาศาสตร์",
        totalSpots: 20,
        hourlyRate: 10,
        isOpenLot: true, // เป็นลานจอด ไม่มีชั้น
      },
      {
        zoneName: "FRONT",
        name: "หน้าคณะวิทยาศาสตร์",
        description: "ลานจอดรถหน้าคณะวิทยาศาสตร์ ใกล้ประตูหลัก",
        building: "คณะวิทยาศาสตร์",
        totalSpots: 30,
        hourlyRate: 10,
        isOpenLot: true, // เป็นลานจอด ไม่มีชั้น
      },
    ];

    const createdZones = await ParkingZone.insertMany(zones);
    console.log(`✅ Created ${createdZones.length} parking zones`);

    // Create Parking Spots (ทุกที่จอดเป็นลานจอด - ไม่มีชั้น)
    const spotFacilities = [
      ["CCTV", "ร่มเงา", "ใกล้ทางเข้า"],
      ["CCTV", "ไฟส่องสว่าง"],
      ["CCTV", "ร่มเงา"],
      ["CCTV", "ไฟส่องสว่าง", "ช่องจอดกว้าง"],
      ["CCTV"],
    ];

    // ชื่อแถว A, B, C, D, E สำหรับสร้างเลขที่จอด
    const rowNames = ["A", "B", "C", "D", "E"];

    let allSpots = [];
    let spotCounter = 1;

    for (const zone of createdZones) {
      const spotsInZone = zone.totalSpots;
      const spotsPerRow = Math.ceil(spotsInZone / rowNames.length);

      let spotIndex = 0;
      for (let row = 0; row < rowNames.length && spotIndex < spotsInZone; row++) {
        for (let col = 0; col < spotsPerRow && spotIndex < spotsInZone; col++) {
          const spotNumber = `${rowNames[row]}${col}`;
          const facilities =
            spotFacilities[Math.floor(Math.random() * spotFacilities.length)];
          const pricePerHour = zone.hourlyRate;

          // Randomly set some spots as occupied or reserved
          let status = "available";
          const random = Math.random();
          if (random < 0.15) {
            status = "occupied";
          } else if (random < 0.20) {
            status = "reserved";
          }

          allSpots.push({
            spotNumber,
            name: `ช่อง ${spotNumber}`,
            zone: zone._id,
            zoneName: zone.zoneName,
            floor: "ลานจอด", // ทุกที่จอดเป็นลานจอด
            building: zone.building,
            status,
            pricePerHour,
            facilities,
          });

          spotIndex++;
          spotCounter++;
        }
      }
    }

    const createdSpots = await ParkingSpot.insertMany(allSpots);
    console.log(`✅ Created ${createdSpots.length} parking spots`);

    // Create Promo Codes
    const promoCodes = [
      {
        code: "SCIPARK2024",
        type: "subscription",
        tier: "diamond",
        durationDays: 30,
        maxUses: 100,
        expiresAt: new Date("2024-12-31"),
        description: "รหัสส่วนลด Diamond 1 เดือน สำหรับผู้ใช้ใหม่",
      },
      {
        code: "WELCOME100",
        type: "points",
        points: 100,
        maxUses: 50,
        expiresAt: new Date("2024-12-31"),
        description: "รับ 100 แต้มฟรี สำหรับสมาชิกใหม่",
      },
      {
        code: "PREDATOR30",
        type: "subscription",
        tier: "predator",
        durationDays: 30,
        maxUses: 20,
        expiresAt: new Date("2024-12-31"),
        description: "รหัสส่วนลด Predator 1 เดือน แบบจำกัด",
      },
      {
        code: "DISCOUNT50",
        type: "discount",
        discountPercent: 50,
        maxUses: 200,
        expiresAt: new Date("2024-12-31"),
        description: "ส่วนลด 50% สำหรับการจองครั้งถัดไป",
      },
      {
        code: "FREEPARKING",
        type: "points",
        points: 500,
        maxUses: 10,
        expiresAt: new Date("2024-06-30"),
        description: "รับ 500 แต้มฟรี! จำกัดเพียง 10 สิทธิ์",
      },
    ];

    const createdPromoCodes = await PromoCode.insertMany(promoCodes);
    console.log(`✅ Created ${createdPromoCodes.length} promo codes`);

    // Create test users
    const testUsers = [
      {
        name: "ทดสอบ ไอรอน",
        email: "iron@test.com",
        username: "ironuser",
        password: "password123",
        phone: "0812345678",
        rank: "Iron",
        points: 50,
      },
      {
        name: "ทดสอบ ไดมอนด์",
        email: "diamond@test.com",
        username: "diamonduser",
        password: "password123",
        phone: "0823456789",
        rank: "Diamond",
        points: 500,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        name: "ทดสอบ เพรดเดเตอร์",
        email: "predator@test.com",
        username: "predatoruser",
        password: "password123",
        phone: "0834567890",
        rank: "Predator",
        points: 1000,
        subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ];

    const hashedUsers = await Promise.all(
      testUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Display summary
    console.log("\n📊 Seeding Summary:");
    console.log("━".repeat(50));
    console.log(`🏢 Parking Zones: ${createdZones.length}`);
    console.log(`🅿️  Parking Spots: ${createdSpots.length}`);
    console.log(`   └─ Available: ${allSpots.filter((s) => s.status === "available").length}`);
    console.log(`   └─ Occupied: ${allSpots.filter((s) => s.status === "occupied").length}`);
    console.log(`   └─ Reserved: ${allSpots.filter((s) => s.status === "reserved").length}`);
    console.log(`🎟️  Promo Codes: ${createdPromoCodes.length}`);
    console.log(`👥 Test Users: ${createdUsers.length}`);
    console.log("━".repeat(50));
    
    console.log("\n🔑 Test User Credentials:");
    console.log("━".repeat(50));
    testUsers.forEach((user) => {
      console.log(`${user.rank} User:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Password: password123`);
      console.log(`  Points: ${user.points}`);
      console.log("");
    });

    console.log("🎫 Promo Codes:");
    console.log("━".repeat(50));
    promoCodes.forEach((code) => {
      console.log(`${code.code} - ${code.description}`);
    });
    console.log("");

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log("👋 Database connection closed");
  process.exit(0);
};

run();
