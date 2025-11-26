# 🚀 SciPark One-Click Deployment Guide

Deploy SciPark ได้ในที่เดียว (Full-Stack) บน Platform ยอดนิยมต่างๆ

---

## 📋 สิ่งที่ต้องเตรียม

1. **GitHub Account** - สำหรับ push code
2. **MongoDB Atlas Account** (ฟรี) - https://www.mongodb.com/cloud/atlas
3. **Platform Account** (เลือก 1 ข้อ):
   - Render.com (แนะนำ - ฟรี)
   - Railway.app
   - Fly.io
   - Heroku

---

## 🎯 Option 1: Deploy บน Render.com (แนะนำ)

### ขั้นตอน:

1. **Push code ไป GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **สร้าง MongoDB Atlas Database**
   - ไปที่ https://cloud.mongodb.com
   - สร้าง Free Cluster (M0)
   - สร้าง Database User
   - Add IP Address: `0.0.0.0/0` (Allow from anywhere)
   - Copy Connection String

3. **Deploy บน Render**
   - ไปที่ https://render.com
   - เชื่อม GitHub repository
   - เลือก "New Web Service"
   - Settings:
     - **Build Command:** `npm install && cd frontend && npm install && npm run build && cd ../backend && npm install`
     - **Start Command:** `cd backend && npm start`
   - เพิ่ม Environment Variables:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=<your-mongodb-uri>
     JWT_SECRET=<generate-random-string>
     ```
   - กด "Create Web Service"

4. **รอ Deploy (~5-10 นาที)**
   - ดู Build logs
   - เมื่อเสร็จจะได้ URL: `https://scipark.onrender.com`

### ✅ ผลลัพธ์:
- Frontend + Backend อยู่ใน URL เดียวกัน
- `/api/*` → Backend APIs
- `/*` → React Frontend

---

## 🚂 Option 2: Deploy บน Railway.app

### ขั้นตอน:

1. **Push code ไป GitHub**

2. **สร้าง MongoDB Atlas Database** (เหมือน Option 1)

3. **Deploy บน Railway**
   - ไปที่ https://railway.app
   - New Project → Deploy from GitHub repo
   - เพิ่ม Environment Variables:
     ```
     NODE_ENV=production
     PORT=3000
     MONGODB_URI=<your-mongodb-uri>
     JWT_SECRET=<generate-random-string>
     ```
   - Railway จะ detect `railway.toml` และ deploy อัตโนมัติ

4. **Generate Domain**
   - Settings → Domains → Generate Domain
   - ได้ URL: `https://scipark.up.railway.app`

---

## 🐳 Option 3: Deploy ด้วย Docker

### สำหรับ VPS/Cloud Server:

```bash
# Clone repo
git clone https://github.com/Kittamets/ise-scipark.git
cd ise-scipark

# สร้าง .env file
cat > .env << EOF
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/scipark
JWT_SECRET=your-secret-key-here
EOF

# Build and run with Docker Compose
docker-compose up -d

# เข้าใช้งานที่ http://localhost:3000
```

### สำหรับ Google Cloud Run / AWS App Runner:

```bash
# Build Docker image
docker build -t scipark .

# Push to registry
docker tag scipark gcr.io/YOUR_PROJECT/scipark
docker push gcr.io/YOUR_PROJECT/scipark

# Deploy on Cloud Run
gcloud run deploy scipark --image gcr.io/YOUR_PROJECT/scipark --platform managed
```

---

## 🌐 Option 4: Deploy บน Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set MONGODB_URI="your-mongodb-uri"
fly secrets set JWT_SECRET="your-secret"

# Deploy
fly deploy
```

---

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | Yes | `3000` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | Yes | Random 32+ chars |
| `REDIS_URL` | Redis URL (optional) | No | `redis://...` |
| `BREVO_USER` | Email service user | No | - |
| `BREVO_PASS` | Email service password | No | - |

---

## 🔧 Troubleshooting

### Build Failed?
```bash
# ตรวจสอบว่า node_modules ไม่ได้อยู่ใน git
git rm -r --cached node_modules
git rm -r --cached frontend/node_modules
git rm -r --cached backend/node_modules
```

### Database Connection Failed?
- ตรวจสอบ IP Whitelist ใน MongoDB Atlas
- ใช้ `0.0.0.0/0` สำหรับ cloud deployment

### Frontend ไม่แสดง?
- ตรวจสอบว่า `NODE_ENV=production`
- ตรวจสอบว่า build สำเร็จ (มี `/frontend/dist`)

---

## 🎉 Done!

หลังจาก deploy สำเร็จ:
- เข้าใช้งานที่ URL ที่ได้รับ
- ลงทะเบียนบัญชีใหม่
- เริ่มจองที่จอดรถ!

---

## 📞 Support

หากมีปัญหา:
- เปิด Issue บน GitHub
- ตรวจสอบ Build Logs บน Platform
- ดู [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
