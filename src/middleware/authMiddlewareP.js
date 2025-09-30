import jwt from "jsonwebtoken";
import Police from "../models/Police.js";

const authMiddlewareP = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const police = await Police.findById(decoded.policeId);

    if (!police || !police.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or inactive account.",
      });
    }

    req.police = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export default authMiddlewareP;
