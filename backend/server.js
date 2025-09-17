import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Replaced OpenAI with GoogleGenerativeAI

// App Config
const app = express();
const port = process.env.PORT || 5000;

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

// Root Route
app.get("/", (req, res) => res.send("API Working"));

// ---------- NEW ChatAI Endpoint with Google Gemini (Conversational) ----------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chatAI", async (req, res) => {
  try {
    const { prompt, context } = req.body; // Expects prompt and chat history (context)
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
// -------------------------------------------------------------------------

// Start Server
app.listen(port, () => console.log("Server started on PORT:", port));