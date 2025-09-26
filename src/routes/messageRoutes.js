/*
import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/messages/:chatId - Get all messages for a chat
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    const messages = await Message.find({ chatId })
      .populate('senderId', 'name role profilePicture')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error fetching messages' 
    });
  }
});

// POST /api/messages - Send a new message
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;

    const newMessage = new Message({
      chatId,
      senderId,
      text
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'name role profilePicture');

    await Chat.findByIdAndUpdate(
      chatId, 
      { 
        lastMessage: savedMessage._id,
        updatedAt: new Date() 
      }
    );

    // 🔥 WEBSOCKET INTEGRATION: Emit new message to all clients in this chat
    const io = req.app.locals.io; // Get io instance from app locals
    
    const messageForBroadcast = {
      _id: savedMessage._id,
      chatId: savedMessage.chatId,
      senderId: {
        _id: savedMessage.senderId._id,
        name: savedMessage.senderId.name,
        role: savedMessage.senderId.role,
        profilePicture: savedMessage.senderId.profilePicture
      },
      text: savedMessage.text,
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt
    };

    // Emit to all clients in the chat room
    io.to(`chat_${chatId}`).emit('new_message', messageForBroadcast);

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error sending message' 
    });
  }
});

export default router;
*/
/*
import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
// CORRECT IMPORT - Make sure this line is exactly like this
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ CORRECTED: Changed 'auth' to 'protect'
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    const messages = await Message.find({ chatId })
      .populate('senderId', 'name role profilePicture')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error fetching messages' 
    });
  }
});

// ✅ CORRECTED: Changed 'auth' to 'protect'
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, senderId, text } = req.body;

    const newMessage = new Message({
      chatId,
      senderId,
      text
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'name role profilePicture');

    await Chat.findByIdAndUpdate(
      chatId, 
      { 
        lastMessage: savedMessage._id,
        updatedAt: new Date() 
      }
    );

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error sending message' 
    });
  }
});

export default router;*/

/*import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/messages/:chatId
router.get('/:chatId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name role profilePicture')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/messages
router.post('/', protect, async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      chatId,
      senderId,
      text
    });

    const savedMessage = await newMessage.save();
    await savedMessage.populate('senderId', 'name role profilePicture');

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date()
    });

    // WebSocket: Broadcast to all users in the chat room
    const io = req.app.locals.io;
    io.to(`chat_${chatId}`).emit('new_message', {
      message: savedMessage,
      action: 'new_message'
    });

    // Notify participants (optional)
    io.to(`chat_${chatId}`).emit('notification', {
      type: 'new_message',
      chatId,
      message: `New message in chat`
    });

    res.status(201).json({ success: true, data: savedMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/messages/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );

    // WebSocket: Notify that message was read
    const io = req.app.locals.io;
    io.to(`chat_${message.chatId}`).emit('message_read', {
      messageId: message._id,
      readerId: req.user._id
    });

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;*/

import express from "express";
import {
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get('/:chatId', protect, getMessages);
router.post('/', protect, upload.single('media'), sendMessage);
router.put('/:id/read', protect, markAsRead);
router.get('/unread/count', protect, getUnreadCount);

export default router;