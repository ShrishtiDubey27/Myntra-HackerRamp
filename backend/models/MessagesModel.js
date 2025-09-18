import mongoose from "mongoose";
import chatDb from "../config/chatdb.js";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "emoji", "audio", "file", "image"],
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === "text" || this.messageType === "emoji";
    },
  },
  audioUrl: {
    type: String,
    required: function () {
      return this.messageType === "audio";
    },
  },
  fileUrl: {
    type: String,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  fileName: {
    type: String,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  fileSize: {
    type: Number,
    required: function () {
      return this.messageType === "file" || this.messageType === "image";
    },
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  },
  messageStatus: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = chatDb.model("Messages", messageSchema);
export default Message;
