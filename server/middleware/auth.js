import jwt  from "jsonwebtoken";
import User from "../models/UserModel.js";
//middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    let token = req.headers.token;

    // ✅ also check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
