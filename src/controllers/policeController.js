import Police from "../models/Police.js";
import jwt from "jsonwebtoken";

// Initialize default police credentials if not exists
export const initializeDefaultPolice = async () => {
  try {
    const existingPolice = await Police.findOne({ username: "admin" });
    if (!existingPolice) {
      const defaultPolice = new Police({
        username: "admin",
        password: "dutycall123",
      });
      await defaultPolice.save();
      console.log("Default police credentials created: admin/dutycall123");
    }
  } catch (error) {
    console.error("Error initializing default police:", error);
  }
};

// Call this function when server starts
// (Call this from your main server file if needed)

// Login police officer
export const loginPolice = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find police officer
    const police = await Police.findOne({ username: username.trim() });
    if (!police) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Check if account is active
    if (!police.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Compare password
    const isPasswordValid = await police.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Update last login
    police.lastLogin = new Date();
    await police.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        policeId: police._id,
        username: police.username,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        police: {
          id: police._id,
          username: police.username,
          lastLogin: police.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Police login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update police credentials
export const updateCredentials = async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    const policeId = req.police.policeId;

    // Validate input
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    if (!newUsername && !newPassword) {
      return res.status(400).json({
        success: false,
        message: "New username or password is required",
      });
    }

    // Find police officer
    const police = await Police.findById(policeId);
    if (!police) {
      return res.status(404).json({
        success: false,
        message: "Police officer not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await police.comparePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update credentials
    const updateData = {};
    if (newUsername) {
      // Check if new username already exists
      const existingPolice = await Police.findOne({
        username: newUsername.trim(),
        _id: { $ne: policeId },
      });
      if (existingPolice) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      }
      updateData.username = newUsername.trim();
    }

    if (newPassword) {
      updateData.password = newPassword;
    }

    // Update the police record
    Object.assign(police, updateData);
    await police.save();

    res.json({
      success: true,
      message: "Credentials updated successfully",
      data: {
        police: {
          id: police._id,
          username: police.username,
          updatedAt: police.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update credentials error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get police dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // You'll need to implement these based on your existing models
    // This is a sample implementation
    const stats = {
      totalReports: 0, // Count from your reports collection
      pendingReports: 0, // Count reports with status 'pending'
      resolvedReports: 0, // Count reports with status 'resolved'
      activeOfficers: 1, // Count active police officers
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get recent reports for police dashboard
export const getRecentReports = async (req, res) => {
  try {
    // Implement based on your existing reports model
    const recentReports = []; // Fetch from your reports collection

    res.json({
      success: true,
      data: recentReports,
    });
  } catch (error) {
    console.error("Recent reports error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get police notifications
export const getPoliceNotifications = async (req, res) => {
  try {
    // Implement based on your existing notifications model
    const notifications = []; // Fetch police-specific notifications

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Police notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
