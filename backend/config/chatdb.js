import mongoose from "mongoose";

const CHAT_DB_URI = process.env.CHAT_DB_URI;

// Create a new, separate connection instance for the chat database
const chatDb = mongoose.createConnection(CHAT_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

chatDb.on("connected", () => {
  console.log("✅ Chat DB connection successful");
});

chatDb.on("error", (err) => {
  console.error("❌ Chat DB connection error:", err.message);
});

export default chatDb;
