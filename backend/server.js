import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser"; // Added for JWT authentication
import mongoose from "mongoose"; // Changed to mongoose for consistency

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------- NEW CHAT-APP IMPORTS ----------
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import setupSocket from "./socket.js";
import { syncUserToChatDB } from "./controllers/SyncController.js";
// ------------------------------------------

// App Config
const app = express();
const port = process.env.PORT || 5000;
const databaseURL = process.env.MONGODB_URI;

// Connect to DB & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cookieParser()); // Added for chat JWT authentication
app.use(
  cors({
    origin: [process.env.ORIGIN], // You must set this in your .env
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Serve static files for chat uploads
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

// API Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Root Route
app.get("/", (req, res) => res.send("API Working"));

// ---------- NEW CHAT-APP API Endpoints ----------
// All chat-related endpoints are mounted under '/api/chat'
app.use("/api/chat/auth", authRoutes);
app.use("/api/chat/contacts", contactsRoutes);
app.use("/api/chat/messages", messagesRoutes);
app.use("/api/chat/channel", channelRoutes);
app.post("/api/chat/sync-user", syncUserToChatDB);
// --------------------------------------------------

// ---------- AI Endpoint with Google Gemini (Conversational) ----------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chatAI", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const contextString = context
      .map((msg) => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`)
      .join("\n");

    const fullPrompt = `${contextString}\nUser: ${prompt}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    const botPrefix = /^bot[:\s-]*\s*/i;
    if (botPrefix.test(text)) {
      text = text.replace(botPrefix, "").trim();
    }

    res.json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// -------------------------------------------------------------------------

// Start Server and Setup Socket.io
const server = app.listen(port, () => {
  console.log("Server started on PORT:", port);
});

// Setup Socket.io for real-time chat
setupSocket(server);

// Connect to MongoDB using the URI from .env
mongoose
  .connect(databaseURL)
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log("DB Connection Error:", err.message);
  });
