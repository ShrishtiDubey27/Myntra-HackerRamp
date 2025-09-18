import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatRouter from "./routes/chatRoute.js";
import { Message, Conversation } from "./models/chatModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// App Config
const app = express();
const httpServer = createServer(app);
const PORT = 3000; // Fixed port for development
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to DB & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chat", chatRouter);

// Root Route
app.get("/", (req, res) => res.send("API Working"));

// ---------- ChatAI Endpoint with Google Gemini (Conversational) ----------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chatAI", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build context string from message history for the AI
    const contextString = context
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
      .join('\n');

    const fullPrompt = `${contextString}\nUser: ${prompt}`;

    // Send the full conversation history to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response by removing the "Bot:" prefix if it exists
    const botPrefix = /^bot[:\s-]*\s*/i;
    if (botPrefix.test(text)) {
      text = text.replace(botPrefix, '').trim();
    }

    res.json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Online users tracking
const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId

// Socket.IO Connection Handling
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User signs in
    socket.on("user_connected", async (userId) => {
        onlineUsers.set(userId, socket.id);
        userSockets.set(socket.id, userId);
        
        // Broadcast to all clients that a new user is online
        io.emit("user_status_changed", {
            userId,
            status: "online"
        });
    });

    // Join a chat room
    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined chat: ${conversationId}`);
    });

    // Handle new message
    socket.on("send_message", async (messageData) => {
        try {
            const { sender, content, conversationId } = messageData;
            
            // Save message to database
            const newMessage = new Message({
                sender,
                content,
                conversation: conversationId
            });
            await newMessage.save();
            
            // Update conversation's last message
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id
            });

            // Broadcast message to all users in the conversation
            io.to(conversationId).emit("receive_message", {
                ...messageData,
                _id: newMessage._id,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    // Handle get online users
    socket.on("get_online_users", () => {
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit("online_users_list", onlineUserIds);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        const userId = userSockets.get(socket.id);
        if (userId) {
            onlineUsers.delete(userId);
            userSockets.delete(socket.id);
            
            // Broadcast to all clients that user went offline
            io.emit("user_status_changed", {
                userId,
                status: "offline"
            });
        }
        console.log("User disconnected:", socket.id);
    });
});

// Start Server
httpServer.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
    console.log(`Server is running on http://localhost:${PORT}`);
});