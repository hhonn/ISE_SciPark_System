import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import mongoSanitize from "express-mongo-sanitize"
import xss from "xss-clean"
import path from "path"
import fs from "fs"
import { fileURLToPath } from 'url'

import connectDB from "./config/db.js"
import { initializeRedis, closeRedis } from "./config/redis.js"
import { startAutoCancelScheduler } from "./services/autoCancelService.js"

import authRouter from "./routes/authRoute.js"
import vehicleRouter from "./routes/vehicleRoutes.js"
import bookingRouter from "./routes/bookingRoutes.js"
import parkingRouter from "./routes/parkingRoute.js"
import privilegesRouter from "./routes/privilegesRoute.js"
import userRouter from "./routes/userRoutes.js"
import paymentMethodRouter from "./routes/paymentMethodRoutes.js"
import notificationRouter from "./routes/notificationRoutes.js"

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Initialize Redis (optional - app continues if Redis fails)
initializeRedis().catch(err => {
  console.log('⚠️  Redis initialization failed, continuing without cache:', err.message);
});

// Start Auto-Cancel Scheduler (after DB connection)
setTimeout(() => {
  startAutoCancelScheduler();
}, 2000); // Wait 2 seconds for DB connection

// Security middleware
// app.use(helmet()); // Set security HTTP headers
// app.use(mongoSanitize()); // Prevent NoSQL injection
// app.use(xss()); // Prevent XSS attacks

// Request size limiting
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

// Implement CORS with more specific configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.CLIENT_URL
    ].filter(Boolean), // Allow multiple frontend ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// Rate limiting
const limiter = rateLimit({
    max: 1000, // 1000 requests
    windowMs: 60 * 60 * 1000, // per 1 hour
    message: 'Too many requests, please try again in an hour!'
});
app.use('/api', limiter);

// Request logging
app.use(morgan('dev'));

// API Root route
app.get('/api', (req, res) => {
  res.send({
    message: "SciPark API is running",
    version: "1.0.0",
    docs: "/docs"
  });
});

// Health Check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const mongoose = await import('mongoose');
    const dbStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      services: {
        autoCancelScheduler: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

// Auth routes
app.use('/api/auth', authRouter);
// Vehicle routes
app.use('/api/vehicles', vehicleRouter);
// Booking routes
app.use('/api/bookings', bookingRouter);
// Parking routes
app.use('/api/parking', parkingRouter);
// Privileges routes
app.use('/api/privileges', privilegesRouter);
// User routes
app.use('/api/user', userRouter);
// Payment Method routes
app.use('/api/payment-methods', paymentMethodRouter);
// Notification routes
app.use('/api/notifications', notificationRouter);

// ============================================
// Serve Frontend Static Files
// ============================================
// Check for frontend build in multiple locations
const possiblePaths = [
  path.join(__dirname, '../frontend/dist'),     // Standard deployment
  path.join(__dirname, 'frontend-dist'),        // Docker deployment
  path.join(__dirname, '../frontend-dist'),     // Alternative
];

let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    console.log(`📁 Serving frontend from: ${p}`);
    break;
  }
}

if (frontendPath) {
  // Serve static files from the frontend build directory
  app.use(express.static(frontendPath));
  
  // Handle React Router - serve index.html for all non-API routes
  // Use RegExp to match all routes (Express 5 compatible)
  app.get(/.*/, (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log('⚠️  Frontend build not found. Running API-only mode.');
  // Fallback root route if frontend is not available
  app.get('/', (req, res) => {
    res.send("SciPark API is running... (Frontend not found)");
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM signal received: closing HTTP server');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT signal received: closing HTTP server');
  await closeRedis();
  process.exit(0);
});

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
});