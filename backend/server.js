import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import OpenAI from "openai";

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

// ---------- NEW ChatAI Endpoint with OpenAI ----------
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chatAI", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: `You are a fashion expert. Answer this question: ${prompt}` }
      ],
    });

    const botMessage = completion.choices[0].message.content;
    res.json({ text: botMessage });
  } catch (err) {
    console.error("OpenAI API error:", err.message);
    res.status(500).json({ text: "OpenAI API request failed!" });
  }
});
// -------------------------------------------

// Start Server
app.listen(port, () => console.log("Server started on PORT:", port));
