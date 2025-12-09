# 🚀 SciPark - คู่มือ Deploy บน Render.com (ฟรี 100%)

## 📋 สิ่งที่ต้องเตรียม

1. **GitHub Account** - สำหรับเชื่อม Repository
2. **Render.com Account** - สมัครฟรีที่ https://render.com
3. **MongoDB Atlas** - ฐานข้อมูล Cloud ฟรี (มีอยู่แล้ว)

---

## 🎯 ขั้นตอน Deploy แบบ Step-by-Step

### Step 1: Push Code ไป GitHub

```powershell
cd c:\ise-scipark
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: สร้าง Web Service บน Render.com

1. ไปที่ https://render.com และ Sign In
2. คลิก **"New +"** → **"Web Service"**
3. เลือก **"Connect a Repository"**
4. เชื่อม GitHub Account และเลือก repository `ISE_SciPark_System`
5. ตั้งค่าดังนี้:

| Setting | Value |
|---------|-------|
| **Name** | `scipark` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | ว่างไว้ (ใช้ root) |
| **Runtime** | `Node` |
| **Build Command** | `npm install && cd frontend && npm install && npm run build && cd ../backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Instance Type** | `Free` |

### Step 3: ตั้งค่า Environment Variables

ใน Render Dashboard → **Environment** → เพิ่ม Variables เหล่านี้:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `3000` | Server port |
| `MONGO_URI` | `mongodb+srv://admin:1234@ise.qxi98tc.mongodb.net/?retryWrites=true&w=majority` | MongoDB Atlas URI |
| `JWT_SECRET` | (Generate: ใส่ random string ยาวๆ) | ใช้สำหรับ authentication |
| `SMTP_USER` | `972cc2001@smtp-brevo.com` | Brevo SMTP (optional) |
| `SMTP_PASSWORD` | (API Key จาก Brevo) | สำหรับส่ง Email |
| `CLIENT_URL` | (ใส่หลัง deploy เสร็จ) | Frontend URL |

> 💡 **Tip**: JWT_SECRET ควรยาว 32+ ตัวอักษร เช่น `scipark_super_secret_jwt_key_2024_production_v1`

### Step 4: Deploy!

1. คลิก **"Create Web Service"**
2. รอ Build (ประมาณ 3-5 นาที)
3. เมื่อเสร็จจะได้ URL: `https://scipark.onrender.com`

### Step 5: อัพเดท CLIENT_URL

หลัง deploy สำเร็จ:
1. กลับไปที่ **Environment** 
2. เพิ่ม `CLIENT_URL` = `https://scipark.onrender.com`
3. คลิก **"Save Changes"** (จะ redeploy อัตโนมัติ)

---

## ✅ ตรวจสอบว่าระบบทำงาน

### 1. ตรวจสอบ Health Check
```
https://scipark.onrender.com/health
```
ควรได้ response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-..."
}
```

### 2. ตรวจสอบ API
```
https://scipark.onrender.com/api
```
ควรได้:
```json
{
  "message": "SciPark API is running",
  "version": "1.0.0"
}
```

### 3. เปิด Frontend
```
https://scipark.onrender.com
```
ควรเห็นหน้า Landing Page ของ SciPark

---

## 🧪 ทดสอบระบบ

### Test 1: สมัครสมาชิก
1. เปิด https://scipark.onrender.com
2. คลิก "สมัครสมาชิก"
3. กรอกข้อมูลและสมัคร

### Test 2: เข้าสู่ระบบ
1. Login ด้วยข้อมูลที่สมัคร
2. ควรเข้าหน้า Dashboard ได้

### Test 3: จองที่จอดรถ
1. เลือกโซนจอดรถ
2. เลือกช่องจอด
3. กด "จอง"
4. ตรวจสอบ Active Booking

### Test 4: Check-in/Check-out
1. ไปที่ Active Booking
2. กด Check-in
3. กด Check-out
4. ดู Booking History

---

## 🔧 Troubleshooting

### ปัญหา: Build Failed
- ตรวจสอบ Build Logs ใน Render Dashboard
- ตรวจสอบว่า package.json ถูกต้อง

### ปัญหา: Database Connection Failed
- ตรวจสอบ MONGO_URI ใน Environment Variables
- ตรวจสอบ IP Whitelist ใน MongoDB Atlas (ใส่ 0.0.0.0/0 สำหรับ allow all)

### ปัญหา: API ไม่ทำงาน
- ตรวจสอบ /health endpoint
- ดู Logs ใน Render Dashboard

### ปัญหา: Free tier sleep
- Render Free tier จะ sleep หลัง 15 นาที inactive
- Request แรกหลัง sleep จะช้า 30-60 วินาที (cold start)
- วิธีแก้: ใช้ UptimeRobot ping ทุก 14 นาที

---

## 📊 MongoDB Atlas Setup (ถ้ายังไม่มี)

1. ไปที่ https://cloud.mongodb.com
2. สร้าง Free Cluster
3. Database Access → Add User
4. Network Access → Add IP: `0.0.0.0/0`
5. คัดลอก Connection String

---

## 🎉 สรุป

ระบบ SciPark พร้อมใช้งานบน Render.com:

- **URL**: `https://scipark.onrender.com`
- **API**: `https://scipark.onrender.com/api`
- **Cost**: ฟรี 100%
- **Region**: Singapore
- **Auto Deploy**: เปิดใช้งาน

### ฟีเจอร์ที่ใช้ได้:
- ✅ สมัครสมาชิก/เข้าสู่ระบบ
- ✅ ดูที่จอดรถว่าง
- ✅ จองที่จอดรถ
- ✅ Check-in/Check-out
- ✅ ประวัติการจอง
- ✅ จัดการรถยนต์
- ✅ ระบบสิทธิพิเศษ
- ✅ การแจ้งเตือน
- ✅ QR Code สำหรับ Check-in

---

## 📝 หมายเหตุ

- Free tier มี 750 ชั่วโมง/เดือน (เพียงพอสำหรับ 1 service 24/7)
- จะ sleep หลัง 15 นาที inactive
- Build time จำกัด 500 นาที/เดือน
- Bandwidth 100 GB/เดือน

สำหรับ Production จริง แนะนำอัพเกรดเป็น Starter ($7/เดือน) เพื่อ:
- ไม่มี sleep
- Better performance
- Custom domain
