import mongoose from "mongoose";
import chatDb from "../config/chatdb.js";

const chatUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
    profileSetup: { type: Boolean, default: false },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    color: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatUser = chatDb.model("Users", chatUserSchema);
export default ChatUser;
