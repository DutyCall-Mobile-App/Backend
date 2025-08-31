//index.js
// Updated index.js (added static serving for uploads)
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import reportRoutes from "./routes/reportRoutes.js"; // Changed to lowercase
import path from "path";
import cors from "cors"; // Add CORS
import fs from "fs"; // Add fs for folder creation
const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use(cors());
// Add JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files for uploads
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes); // Fixed route handler name
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};
startServer();
