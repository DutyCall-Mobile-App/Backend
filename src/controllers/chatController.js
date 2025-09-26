import Chat from "../models/Chat.js";
import Report from "../models/reportModel.js";
import User from "../models/UserModel.js";
import { sendChatNotification } from "../services/fcmService.js";

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({ participants: userId, isActive: true })
      .populate('participants', 'name email role profilePicture isOnline lastSeen')
      .populate('issueId', 'title status category')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'senderId',
          select: 'name role'
        }
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a specific chat
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email role profilePicture phone isOnline lastSeen')
      .populate('issueId', 'title description category status priority')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { issueId } = req.body;

    // Check if report exists
    const report = await Report.findById(issueId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Check if chat already exists for this issue
    const existingChat = await Chat.findOne({ issueId, isActive: true });
    if (existingChat) {
      return res.status(400).json({
        success: false,
        error: 'A chat for this issue already exists'
      });
    }

    // Determine participants: reporter and police officers (or admins)
    const participants = [report.reportedBy];
    
    // If report is assigned to someone, add them to the chat
    if (report.assignedTo) {
      participants.push(report.assignedTo);
    } else {
      // Alternatively, add all police users (for demo purposes)
      const policeUsers = await User.find({ role: 'police' }).limit(3); // Limit to 3 police users
      policeUsers.forEach(user => participants.push(user._id));
    }

    const newChat = new Chat({
      issueId,
      participants
    });

    const savedChat = await newChat.save();
    await savedChat.populate('participants', 'name email role profilePicture');
    await savedChat.populate('issueId', 'title status');

    // Send notifications to participants (except the creator)
    await sendChatNotification(savedChat, req.user);

    // WebSocket: Notify participants about new chat
    const io = req.app.locals.io;
    participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_chat', {
        chat: savedChat,
        message: 'A new chat has been created for an issue you are involved with'
      });
    });

    res.status(201).json({
      success: true,
      data: savedChat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update user's FCM token
export const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    
    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};