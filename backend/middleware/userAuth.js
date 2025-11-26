import jwt from "jsonwebtoken";

// Middleware to authenticate user using JWT
const userAuth = (req, res, next) => {
  // Try to get token from cookies first
  let token = req.cookies?.token;
  
  // If not in cookies, try Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to request object
    req.userId = decoded.id;

    next();

  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
  }
};

// Export with both names for compatibility
export default userAuth;
export { userAuth as authenticateUser };
export { userAuth as protect };
