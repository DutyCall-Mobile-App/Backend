/*import express from "express";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chats/officer/:officerId - Get all chats for an officer
router.get('/officer/:officerId', protect, async (req, res) => {
  try {
    const officerId = req.params.officerId;

    const chats = await Chat.find({ participants: officerId })
      .populate('participants', 'name email role')
      .populate('issueId', 'title status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error fetching chats' 
    });
  }
});

// POST /api/chats - Create a new chat
router.post('/', protect, async (req, res) => {
  try {
    const { issueId, participants } = req.body;

    // Check if chat already exists for this issue
    const existingChat = await Chat.findOne({ issueId });
    if (existingChat) {
      return res.status(400).json({ 
        success: false, 
        error: 'A chat for this issue already exists.' 
      });
    }

    const newChat = new Chat({
      issueId,
      participants
    });

    const savedChat = await newChat.save();
    await savedChat.populate('participants', 'name email role');
    await savedChat.populate('issueId', 'title status');

    // 🔥 WEBSOCKET INTEGRATION: Notify participants about new chat
    const io = req.app.locals.io;
    participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_chat', {
        chat: savedChat,
        message: 'A new chat has been created'
      });
    });

    res.status(201).json({ success: true, data: savedChat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating chat' 
    });
  }
});

export default router;
*/
/*
import express from "express";
import Chat from "../models/Chat.js";
// CORRECT IMPORT: Import the 'protect' function
import { protect } from "../middleware/authMiddleware.js"; // ✅ Fixed import

const router = express.Router();

// ❌ OLD CODE: You were using 'auth' here, which is not defined
// router.get('/officer/:officerId', auth, async (req, res) => {

// ✅ NEW CODE: Use 'protect' instead of 'auth'
router.get('/officer/:officerId', protect, async (req, res) => {
  try {
    const officerId = req.params.officerId;
    const chats = await Chat.find({ participants: officerId })
      .populate('participants', 'name email role')
      .populate('issueId', 'title status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error fetching chats' 
    });
  }
});

// ❌ OLD CODE: Same issue here
// router.post('/', auth, async (req, res) => {

// ✅ NEW CODE: Use 'protect' instead of 'auth'
router.post('/', protect, async (req, res) => {
  try {
    const { issueId, participants } = req.body;
    const existingChat = await Chat.findOne({ issueId });
    if (existingChat) {
      return res.status(400).json({ 
        success: false, 
        error: 'A chat for this issue already exists.' 
      });
    }

    const newChat = new Chat({
      issueId,
      participants
    });

    const savedChat = await newChat.save();
    await savedChat.populate('participants', 'name email role');
    await savedChat.populate('issueId', 'title status');

    res.status(201).json({ success: true, data: savedChat });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating chat' 
    });
  }
});

export default router;*/
/*import express from "express";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chats/officer/:officerId
router.get('/officer/:officerId', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.officerId })
      .populate('participants', 'name email role')
      .populate('issueId', 'title status')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/chats
router.post('/', protect, async (req, res) => {
  try {
    const { issueId, participants } = req.body;

    const existingChat = await Chat.findOne({ issueId });
    if (existingChat) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chat already exists for this issue' 
      });
    }

    const newChat = new Chat({ issueId, participants });
    const savedChat = await newChat.save();
    await savedChat.populate('participants', 'name email role');
    await savedChat.populate('issueId', 'title status');

    // WebSocket: Notify participants about new chat
    const io = req.app.locals.io;
    participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_chat', {
        chat: savedChat,
        message: 'New chat created'
      });
    });

    res.status(201).json({ success: true, data: savedChat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/chats/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email role phone')
      .populate('issueId', 'title description category')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;*/




import express from "express";
import {
  getUserChats,
  getChat,
  createChat,
  updateFcmToken
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/', protect, getUserChats);
router.get('/:id', protect, getChat);
router.post('/', protect, createChat);
router.post('/fcm-token', protect, updateFcmToken);

export default router;