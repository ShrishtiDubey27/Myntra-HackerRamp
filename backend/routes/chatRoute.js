import express from 'express';
import { Message, Conversation } from '../models/chatModel.js';
import User from '../models/userModel.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for a user
router.get("/conversations", auth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate("participants", "name email")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
        
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a specific conversation
router.get("/messages/:conversationId", auth, async (req, res) => {
    try {
        const messages = await Message.find({
            conversation: req.params.conversationId
        })
        .populate("sender", "name email")
        .sort({ createdAt: 1 });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new conversation or get existing one
router.post("/conversation", auth, async (req, res) => {
    try {
        const { participantId, isGroup, groupName } = req.body;
        
        if (!isGroup) {
            // Check if a conversation already exists between these two users
            const existingConversation = await Conversation.findOne({
                isGroup: false,
                participants: { 
                    $all: [req.user._id, participantId],
                    $size: 2
                }
            });
            
            if (existingConversation) {
                return res.json(existingConversation);
            }
        }
        
        const newConversation = new Conversation({
            participants: isGroup ? [...req.body.participants, req.user._id] : [req.user._id, participantId],
            isGroup,
            groupName: isGroup ? groupName : undefined
        });
        
        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
