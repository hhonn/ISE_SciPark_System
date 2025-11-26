# 🅿️ SciPark - Smart Parking Management System

> **ระบบจองที่จอดรถอัจฉริยะ** สำหรับคณะวิทยาศาสตร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณหทารลาดกระบัง  
> จองล่วงหน้า, Real-time availability, Pay-per-Booking

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Express.js](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## 📖 Documentation

- 📄 **[Business Requirements](docs/BUSINESS-REQUIREMENTS.md)** - ความต้องการทางธุรกิจ, Pain Points, Solutions
- 🔄 **[Process Flow Diagrams](docs/PROCESS-FLOW.md)** - Flow diagrams ทั้งหมดพร้อม Mermaid
- 🚀 **[Executive Summary & Pitch Deck](docs/EXECUTIVE-SUMMARY.md)** - เอกสารสำหรับนำเสนอนักลงทุน

---

## 🎯 The Problem

**ปัญหาการจอดรถในคณะ:**
- ❌ ไม่รู้ว่ามีที่จอดหรือไม่
- ❌ ต้องวนหาที่จอด 20-30 นาที
- ❌ ไม่สามารถจองล่วงหน้าได้
- ❌ เสียเวลา, สิ้นเปลืองน้ำมัน, เครียด

## 💡 The Solution: SciPark

**ระบบจองที่จอดรถอัจฉริยะ** ที่ให้คุณ:
- ✅ **รู้ที่ว่างแบบ Real-time** - ไม่ต้องเดา
- ✅ **จองล่วงหน้าผ่านแอป** - มั่นใจว่ามีที่จอดรอรับ
- ✅ **ระบบหาที่ให้อัตโนมัติ** - ไม่ต้องลังเล
- ✅ **QR Code เข้าจอด** - สะดวกรวดเร็ว
- ✅ **ประหยัดเวลา 70%** - จาก 30 นาที → 9 นาที

---

## ✨ Key Features

### 🔍 1. หาที่จอด
- Real-time availability checking
- AI-powered auto-selection
- แสดงรายละเอียดครบถ้วน (ตำแหน่ง, ราคา, สิ่งอำนวยความสะดวก)

### 📱 2. จองที่จอด
- **Pay-per-Booking:** 20 บาท/ครั้ง
- **3 ชั่วโมงแรกฟรี**, เกินคิด 10 บาท/ชม.
- ต้องเข้าจอดภายใน 30 นาที (ไม่งั้นยกเลิกอัตโนมัติ)

### 💳 3. ชำระเงิน
- หลายช่องทาง: บัตรเครดิต, Mobile Banking, QR Payment
- คำนวณอัตโนมัติ
- ใบเสร็จดิจิทัล

### 🚗 4. เข้า-ออกจอด
- QR Code verification
- นับเวลาอัตโนมัติ
- Alert เมื่อเกิดปัญหา

### 👑 5. Membership Tiers (Phase 3)
- 🥉 **Iron:** ฟรี (ไม่มีส่วนลด)
- 💎 **Diamond:** 299 ฿/เดือน (ลด 10%)
- 👹 **Predator:** 599 ฿/เดือน (ลด 15% + Priority)

---

## 🏗️ Project Structure

```
ise-scipark/
├── frontend/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/   # UI Components
│   │   ├── pages/        # Pages (Home, Login, Booking, etc.)
│   │   ├── stores/       # Zustand State Management
│   │   ├── utils/        # API Client & Helpers
│   │   └── index.css     # Tailwind CSS
│   ├── public/           # Static Assets
│   └── vite.config.js    # Vite Configuration
│
├── backend/              # Express + MongoDB Backend
│   ├── config/          # Database & Email Config
│   ├── controllers/     # Business Logic
│   ├── models/          # MongoDB Schemas
│   ├── routes/          # API Routes
│   ├── middleware/      # Auth Middleware
│   └── index.js         # Express Server
│
└── docs/                # Documentation
    ├── BUSINESS-REQUIREMENTS.md  # Business context
    ├── PROCESS-FLOW.md          # Process diagrams
    └── EXECUTIVE-SUMMARY.md     # Pitch deck
```

---

## 💻 Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite 5** - Build Tool (⚡ Lightning Fast HMR)
- **Tailwind CSS 3** - Utility-first CSS
- **Framer Motion** - Animations
- **Zustand** - State Management
- **Axios** - HTTP Client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Express.js 4** - Web Framework
- **MongoDB Atlas** - Cloud Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email Service
- **Brevo** - SMTP Provider
- **Helmet** - Security
- **Express Rate Limit** - DDoS Protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (ฟรี)

### 1. Clone Repository
```bash
git clone https://github.com/hhonn/ISE_SciPark_System.git
cd ISE_SciPark_System
```

### 2. Setup Backend
```bash
cd backend
npm install

# สร้าง .env
cp .env.example .env
# แก้ไข .env ใส่ MongoDB URI และ Email credentials

# Seed database (optional)
npm run seed

# Start server
npm start
# Backend: http://localhost:3000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# สร้าง .env
cp .env.example .env
# แก้ไข .env ใส่ API URL

# Start dev server
npm run dev
# Frontend: http://localhost:5173
```

### 4. Open Browser
```
http://localhost:5173
```

---

## 🧪 Test Accounts

```
Email: iron@test.com
Password: password123
Tier: Iron (ไม่มีส่วนลด)

Email: diamond@test.com
Password: password123
Tier: Diamond (ส่วนลด 10%)

Email: predator@test.com
Password: password123
Tier: Predator (ส่วนลด 15%)
```

---

## 📊 Database Schema

### Users
- name, email, password (hashed)
- memberTier (iron/diamond/predator)
- points, totalSpent

### Parking Zones
- name, location
- totalSpots, availableSpots
- pricePerHour

### Parking Spots
- spotNumber, zone
- status (available/occupied/maintenance)

### Bookings
- user, parkingSpot
- startTime, endTime
- status (pending/active/completed/cancelled)
- totalPrice

### Vehicles
- user, plateNumber, type

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register
POST   /api/auth/login         # Login
POST   /api/auth/verify-otp    # Verify OTP
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # Logout
```

### Parking
```
GET    /api/parking/zones      # Get all zones
GET    /api/parking/spots      # Get available spots
GET    /api/parking/spot/:id   # Get spot details
```

### Bookings
```
POST   /api/bookings           # Create booking
GET    /api/bookings           # Get user bookings
GET    /api/bookings/:id       # Get booking details
PUT    /api/bookings/:id       # Update booking
DELETE /api/bookings/:id       # Cancel booking
```

### Vehicles
```
POST   /api/vehicles           # Add vehicle
GET    /api/vehicles           # Get user vehicles
DELETE /api/vehicles/:id       # Delete vehicle
```

---

## 🎨 UI Components

- **Gradient Backgrounds** - สวยงามด้วย Tailwind Gradients
- **Smooth Animations** - Framer Motion
- **Responsive Design** - Mobile-first
- **Dark Mode Ready** - เตรียมพร้อม (ยังไม่เปิดใช้งาน)
- **Toast Notifications** - Real-time feedback

---

## 📈 Future Roadmap

### Phase 3: Advanced Features (Months 5-6)
- 🤖 AI Prediction (ทำนายความว่าง)
- 🗺️ Interactive Map
- 🚗 Multiple Vehicles Support
- 💳 Monthly Subscription
- 🎁 Reward Points System

### Phase 4+: Smart Campus (Year 2)
- 📡 IoT Sensors Integration
- 📹 CCTV + License Plate Recognition
- 📊 Parking Analytics Dashboard
- 🔌 API for Third-party Integration
- 🌐 Multi-campus Support

---

## 💰 Business Model

### Revenue Streams:
1. **Booking Fees:** 20 ฿/ครั้ง
2. **Overtime Fees:** 10 ฿/ชม. (หลัง 3 ชั่วโมง)
3. **Membership:** 299-599 ฿/เดือน
4. **Enterprise License:** ขายให้สถาบันอื่น

### Projections:
- **Year 1:** ~5M บาท
- **Year 2:** ~15M บาท
- **Year 3:** ~40M บาท

📊 **[ดูรายละเอียดเพิ่มเติม](docs/EXECUTIVE-SUMMARY.md)**

---

## 🎓 Team & Credits

**Developed by:**
- 👥 คณะวิทยาศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี
- 💻 นิสิต นักพัฒนา นักออกแบบ และอาจารย์ที่ปรึกษา
- 🤝 Cross-functional Team

**Special Thanks:**
- GitHub Copilot for development assistance
- KMUTT for support and resources

---

## 📞 Contact & Support

```
📧 Author:   Nattawut Chaturaponkul
📱 GitHub:   https://github.com/hhonn/ISE_SciPark_System
📍 Location: คณะวิทยาศาสตร์ สจล.
```

---

## 📄 License

MIT License - สามารถนำไปใช้ต่อยอดได้

---

## 🌟 Support This Project

ถ้าคุณชอบโปรเจคนี้:
- ⭐ **Star** this repo
- 🍴 **Fork** and contribute
- 📣 **Share** with others
- 💬 **Give feedback**

---

**Made with ❤️ by SciPark Team**

> *"Making Parking Smart, One Spot at a Time"*

    ├── README.md        # Overview- ✅ Frontend (React) → Netlify Static Hosting

    ├── DEPLOYMENT.md    # Deployment guide- ✅ Backend (API) → Netlify Functions (Serverless)

    └── ...              # Other docs- ✅ Database → MongoDB Atlas (Cloud Database)

```

**ทุกอย่างฟรี 100%!** 🎉

---

## 🚀 Quick Start

## 🚀 Quick Start

### 1️⃣ ติดตั้ง Dependencies

### Prerequisites

- Node.js 18+ ```powershell

- MongoDB Atlas Accountnpm install

- npm or yarncd netlify/functions && npm install && cd ../..

```

### 1️⃣ Clone Repository

```bash### 2️⃣ Setup MongoDB Atlas (ฟรี!)

git clone https://github.com/hhonn/ISE_SciPark_System.git

cd ISE_SciPark_Systemดูคำแนะนำใน [INSTALL.md](INSTALL.md)

```

### 3️⃣ สร้างไฟล์ .env

### 2️⃣ Setup Backend

```bash```env

cd backendMONGODB_URI=mongodb+srv://...

JWT_SECRET=your-secret-key

# Install dependenciesVITE_API_URL=http://localhost:8888/.netlify/functions

npm install```



# Create .env file### 4️⃣ Run Development

# Copy from .env.example and fill in your values

```powershell

# Seed database# Terminal 1 - Frontend

node scripts/seed.jsnpm run dev



# Start development server# Terminal 2 - Backend  

npm run devnetlify dev

``````



Backend will run on: `http://localhost:3000`เปิดเบราว์เซอร์: http://localhost:3000



### 3️⃣ Setup Frontend## 📚 Documentation

```bash

cd frontend- 🔧 **[INSTALL.md](INSTALL.md)** - คู่มือติดตั้งแบบละเอียด (เริ่มที่นี่!)

- 📖 **[README-FULLSTACK.md](README-FULLSTACK.md)** - Documentation ครบทุกรายละเอียด

# Install dependencies- 🏗️ **[STRUCTURE.md](STRUCTURE.md)** - โครงสร้างโปรเจคและ Architecture

npm install

## 🛠️ Tech Stack

# Start development server

npm run dev### Frontend

```- React 18 + Vite

- Tailwind CSS + Framer Motion

Frontend will run on: `http://localhost:5173`- Zustand (State Management)

- React Router + Axios

---

### Backend

## 🌟 Features- Netlify Functions (Serverless)

- MongoDB Atlas (Cloud Database)

### For Users- JWT Authentication

- 🔐 **Authentication** - ลงทะเบียน/เข้าสู่ระบบด้วย Email/Username

- 🅿️ **Real-time Parking** - ดูช่องว่างแบบเรียลไทม์## 🎨 Design Highlights

- 📱 **Easy Booking** - จองช่องจอดง่ายๆ ไม่กี่คลิก

- ⏱️ **First Hour Free** - ชั่วโมงแรกฟรีสำหรับทุกคนโปรเจคนี้มี Design ที่สวยงามมาก ๆ:

- 💎 **Membership Tiers** - 3 ระดับ: Iron, Diamond, Predator- ✨ Gradient backgrounds & buttons

- ⭐ **Reward Points** - สะสมแต้มทุกครั้งที่จอด- 🎭 Smooth animations with Framer Motion

- 🎫 **Promo Codes** - รับส่วนลดและสิทธิพิเศษ- 💳 Modern card designs

- 📊 **Statistics** - ดูประวัติและสถิติการใช้งาน- 📱 Responsive layout (Mobile-first)

- 🚗 **Vehicle Management** - จัดการรถหลายคัน- 🌈 Beautiful color schemes

- ⚡ Loading states & transitions

### For Admins

- 📍 **Zone Management** - จัดการโซนจอดรถ## 🚀 Deployment to Netlify

- 🅿️ **Spot Control** - อัปเดตสถานะช่องจอดแบบเรียลไทม์

- 📈 **Analytics** - ดูสถิติการใช้งานระบบ1. Push code to GitHub

- 🎟️ **Promo Codes** - สร้างและจัดการโค้ดส่วนลด2. Connect to Netlify (https://app.netlify.com)

3. Build settings:

---   - Build: `npm run build`

   - Publish: `dist`

## 💎 Membership Tiers4. Add environment variables

5. Deploy! 🎉

| Tier | Price | Points/Hour | Discount | First Hour | Priority |

|------|-------|-------------|----------|------------|----------|ดูรายละเอียดใน [INSTALL.md](INSTALL.md)

| **Iron** 🔨 | ฟรี | 2 | - | ✅ | - |

| **Diamond** 💎 | 199฿/เดือน | 5 | 10% | ✅ | - |## 📱 Pages & Features

| **Predator** 👑 | 499฿/เดือน | 10 | 20% | ✅ | ✅ |

- 🏠 **Landing** - Hero, Features, Testimonials

---- 🔐 **Auth** - Login, Register (JWT)

- 📊 **Dashboard** - Available spots, Active booking

## 🛠️ Tech Stack- 🚗 **Parking** - Spot details, Instant booking

- 💎 **Privileges** - Membership tiers (Iron, Diamond, Predator)

### Frontend- 👤 **Profile** - User info, Vehicles, History

- **React 18** - UI framework- 💳 **Payment** - Payment processing

- **Vite 5** - Build tool & dev server

- **Tailwind CSS 3** - Styling## 🎯 Architecture

- **Framer Motion** - Animations

- **Zustand** - State management```

- **Axios** - HTTP clientReact (Vite) → Netlify Functions → MongoDB Atlas

    ↓              ↓                    ↓

### Backend  UI/UX      Serverless API        Cloud Database

- **Express.js** - Web framework```

- **MongoDB + Mongoose** - Database

- **JWT** - Authentication## ⚡ Quick Commands

- **Nodemailer** - Email service

- **Bcrypt** - Password hashing```powershell

# Install

### Securitynpm install

- Helmet.js - Security headers

- Rate limiting# Development

- XSS protectionnpm run dev              # Frontend

- NoSQL injection preventionnetlify dev             # Backend + Frontend

- HTTP-only cookies

# Build

---npm run build



## 📡 API Endpoints# Preview

npm run preview

### Authentication

- `POST /api/auth/register` - Register new user# Deploy

- `POST /api/auth/login` - Loginnetlify deploy --prod

- `POST /api/auth/logout` - Logout```



### Parking## 🐛 Troubleshooting

- `GET /api/parking/zones` - Get all zones

- `GET /api/parking/zones/:id` - Get zone detailsมีปัญหา? ดูที่ [INSTALL.md](INSTALL.md#-troubleshooting)

- `GET /api/parking/spots` - Get all spots

- `GET /api/parking/stats` - Get statistics## 🤝 Contributing



### BookingsPRs welcome! Fork → Create branch → Commit → Push → PR

- `POST /api/bookings` - Create booking

- `GET /api/bookings/active` - Get active booking## 📄 License

- `GET /api/bookings/history` - Get history

- `PUT /api/bookings/:id/complete` - Complete bookingMIT License

- `DELETE /api/bookings/:id` - Cancel booking

## 👨‍💻 Author

### User Profile

- `GET /api/user/profile` - Get profile**SciPark Team** - Made with ❤️ and ☕

- `PUT /api/user/profile` - Update profile

- `PUT /api/user/change-password` - Change password---

- `GET /api/user/stats` - Get user statistics

**🚀 พร้อมเริ่มต้นแล้ว?** อ่าน [INSTALL.md](INSTALL.md) เพื่อติดตั้งภายใน 5 นาที!

### Privileges
- `GET /api/privileges` - Get membership tiers
- `POST /api/privileges/subscribe` - Subscribe to tier
- `POST /api/privileges/redeem` - Redeem promo code

### Vehicles
- `POST /api/vehicles` - Add vehicle
- `GET /api/vehicles` - Get user's vehicles
- `DELETE /api/vehicles/:id` - Remove vehicle

---

## 🧪 Test Accounts

After running seed script:

| Rank | Email | Username | Password | Points |
|------|-------|----------|----------|--------|
| Iron | iron@test.com | ironuser | password123 | 50 |
| Diamond | diamond@test.com | diamonduser | password123 | 500 |
| Predator | predator@test.com | predatoruser | password123 | 1000 |

---

## 🎫 Test Promo Codes

| Code | Type | Benefit |
|------|------|---------|
| SCIPARK2024 | Subscription | Diamond 30 days |
| WELCOME100 | Points | 100 points |
| PREDATOR30 | Subscription | Predator 30 days |
| DISCOUNT50 | Discount | 50% off next booking |
| FREEPARKING | Points | 500 points |

---

## 🚢 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

Environment variables needed:
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway/Render)
```bash
cd backend
# Connect to Railway/Render
# Set environment variables from .env
# Deploy automatically
```

Environment variables needed:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_USER=...
EMAIL_PASS=...
PORT=3000
CLIENT_URL=https://your-frontend.netlify.app
```

**📖 For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

---

## 📚 Documentation

- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Complete deployment guide
- **[BACKEND-MIGRATION.md](docs/BACKEND-MIGRATION.md)** - Backend architecture & migration
- **[MIGRATION-SUMMARY.md](docs/MIGRATION-SUMMARY.md)** - Quick reference guide
- **[PROJECT-COMPLETE.md](docs/PROJECT-COMPLETE.md)** - Project completion report
- **[STRUCTURE.md](docs/STRUCTURE.md)** - Project structure details

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Nattawut Chaturaponkul**
- GitHub: [@hhonn](https://github.com/hhonn)
- Project: ISE SciPark System

---

## 🙏 Acknowledgments

- React Team
- Express.js Community
- MongoDB Team
- Tailwind CSS
- All open-source contributors

---

## 📞 Support

For issues and questions:
- 📧 Open an issue on GitHub
- 💬 Check existing documentation in `docs/`

---

**Made with ❤️ for better parking management**
