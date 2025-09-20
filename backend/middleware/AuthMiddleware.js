import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Try to get token from cookies first (for chat system)
  let token = req.cookies.jwt;

  // If no cookie token, try Authorization header (for API calls)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return res.status(401).send("You are not authenticated!");

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      console.log("Token verification error:", err.message);
      return res.status(403).send("Token is not valid!");
    }
    console.log("Token payload:", payload);
    req.userId = payload?.id; // Use 'id' instead of 'userId' from token payload
    console.log("Set req.userId to:", req.userId);
    next();
  });
};
