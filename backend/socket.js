import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
import ChatUser from "./models/ChatUserModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const addChannelNotify = async (channel) => {
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("new-channel-added", channel);
        }
      });
    }
  };

  const sendMessage = async (message) => {
    const recipientSocketId = userSocketMap.get(message.recipient);
    const senderSocketId = userSocketMap.get(message.sender);

    // Prepare message data
    const messageData = { ...message };

    // Ensure poll data is included if it's a poll message
    if (message.messageType === "poll" && message.pollId && message.pollData) {
      messageData.pollId = message.pollId;
      messageData.pollData = message.pollData;
    }

    // Create the message
    const createdMessage = await Message.create(messageData);

    // Find the created message by its ID and populate sender and recipient details
    const messageResponse = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color name")
      .populate("recipient", "id email firstName lastName image color name")
      .exec();

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageResponse);

      // Send unread count update to recipient
      const unreadCount = await Message.countDocuments({
        recipient: message.recipient,
        sender: message.sender,
        isRead: false,
      });
      io.to(recipientSocketId).emit("unreadCountUpdate", {
        senderId: message.sender,
        count: unreadCount,
      });
    }

    // Optionally, send the message back to the sender (e.g., for message confirmation)
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageResponse);
    }
  };

  const sendChannelMessage = async (message) => {
    const {
      channelId,
      sender,
      content,
      messageType,
      fileUrl,
      pollId,
      pollData,
    } = message;

    // Create and save the message
    const messageData = {
      sender,
      recipient: null, // Channel messages don't have a single recipient
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    };

    // Add poll-specific fields if it's a poll message
    if (messageType === "poll" && pollId && pollData) {
      messageData.pollId = pollId;
      messageData.pollData = pollData;
    }

    const createdMessage = await Message.create(messageData);

    const messageResponse = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color name")
      .exec();

    // Add message to the channel
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    // Fetch all members of the channel
    const channel = await Channel.findById(channelId).populate("members");

    const finalData = { ...messageResponse._doc, channelId: channel._id };
    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  };

  const markAsRead = async (data) => {
    const { senderId, recipientId } = data;

    await Message.updateMany(
      {
        sender: senderId,
        recipient: recipientId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
        messageStatus: "seen",
      }
    );

    // Notify sender that messages have been read
    const senderSocketId = userSocketMap.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readBy: recipientId,
        timestamp: new Date(),
      });
    }

    // Update unread count for recipient
    const recipientSocketId = userSocketMap.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("unreadCountUpdate", {
        senderId: senderId,
        count: 0,
      });
    }
  };

  const disconnect = (socket) => {
    console.log("Client disconnected", socket.id);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        // Update user offline status
        ChatUser.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        }).catch(console.error);

        // Notify all connected users that this user is offline
        socket.broadcast.emit("userOffline", userId);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);

      // Update user online status
      ChatUser.findByIdAndUpdate(userId, { isOnline: true }).catch(
        console.error
      );

      // Notify all connected users that this user is online
      socket.broadcast.emit("userOnline", userId);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("add-channel-notify", addChannelNotify);

    socket.on("sendMessage", sendMessage);

    socket.on("send-channel-message", sendChannelMessage);

    socket.on("markAsRead", markAsRead);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
