import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/UserModel.js";
import { sendMessageNotification } from "../services/fcmService.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Get all messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access these messages'
      });
    }
    
    const messages = await Message.find({ chatId })
      .populate('senderId', 'name role profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read by current user
    const unreadMessages = messages.filter(
      message => !message.readBy.includes(req.user._id) && 
                 message.senderId._id.toString() !== req.user._id.toString()
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: req.user._id }, status: 'read' }
      );
    }

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total: await Message.countDocuments({ chatId })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, messageType = 'text' } = req.body;
    const senderId = req.user._id;
    let mediaUrl = null;

    // Handle file upload if present
    if (req.file && (messageType === 'image' || messageType === 'file')) {
      try {
        const result = await uploadToCloudinary(req.file);
        mediaUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to upload media'
        });
      }
    }

    // Verify user has access to this chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this chat'
      });
    }

    const newMessage = new Message({
      chatId,
      senderId,
      text,
      messageType,
      mediaUrl
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'name role profilePicture');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date()
    });

    // Send FCM notifications to other participants
    const sender = await User.findById(senderId);
    await sendMessageNotification(sender, chatId, text);

    // WebSocket: Broadcast to all users in the chat room
    const io = req.app.locals.io;
    io.to(`chat_${chatId}`).emit('new_message', {
      message: savedMessage,
      action: 'new_message'
    });

    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { 
        $addToSet: { readBy: req.user._id },
        status: 'read'
      },
      { new: true }
    ).populate('senderId', 'name role');

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // WebSocket: Notify that message was read
    const io = req.app.locals.io;
    io.to(`chat_${message.chatId}`).emit('message_read', {
      messageId: message._id,
      readerId: req.user._id
    });

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get unread message count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all chats the user is participating in
    const userChats = await Chat.find({ 
      participants: userId, 
      isActive: true 
    }).select('_id');
    
    const chatIds = userChats.map(chat => chat._id);
    
    // Count unread messages (messages not read by the user)
    const unreadCount = await Message.countDocuments({
      chatId: { $in: chatIds },
      senderId: { $ne: userId },
      readBy: { $ne: userId }
    });
    
    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};