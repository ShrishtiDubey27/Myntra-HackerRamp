import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import ChatUser from "../models/ChatUserModel.js";

export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId;
    const admin = await ChatUser.findById(userId);
    if (!admin) {
      return response.status(400).json({ message: "Admin user not found." });
    }

    const validMembers = await ChatUser.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response
        .status(400)
        .json({ message: "Some members are not valid users." });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    return response.status(201).json({ channel: newChannel });
  } catch (error) {
    console.error("Error creating channel:", error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("admin", "firstName lastName email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ channels });
  } catch (error) {
    console.error("Error getting user channels:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find({})
      .populate("admin", "firstName lastName email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ channels });
  } catch (error) {
    console.error("Error getting all channels:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id image color",
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const messages = channel.messages;
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting channel messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChannelDetails = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    const channel = await Channel.findById(channelId)
      .populate("admin", "firstName lastName email _id image color")
      .populate("members", "firstName lastName email _id image color")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "firstName lastName email _id image color",
        },
      });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is member or admin
    const isMember =
      channel.members.some((member) => member._id.toString() === userId) ||
      channel.admin._id.toString() === userId;

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Extract media and links from messages
    const mediaMessages = channel.messages
      .filter(
        (msg) =>
          msg.messageType === "image" ||
          msg.messageType === "file" ||
          msg.messageType === "audio"
      )
      .map((msg) => ({
        _id: msg._id,
        messageType: msg.messageType,
        fileUrl: msg.fileUrl || msg.audioUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        sender: msg.sender,
        timestamp: msg.timestamp,
      }));

    const linkMessages = channel.messages.filter(
      (msg) =>
        msg.messageType === "text" &&
        msg.content &&
        msg.content.includes("http")
    );

    const response = {
      channel: {
        _id: channel._id,
        name: channel.name,
        description: channel.description || "",
        admin: channel.admin,
        members: channel.members,
        createdAt: channel.createdAt,
        updatedAt: channel.updatedAt,
      },
      members: channel.members, // Add this for backward compatibility
      messages: channel.messages, // Add this for frontend to access messages
      media: mediaMessages,
      links: linkMessages,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error getting channel details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const leaveChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.userId;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is admin
    if (channel.admin.toString() === userId) {
      return res.status(400).json({
        message: "Admin cannot leave the group. Transfer admin rights first.",
      });
    }

    // Check if user is a member
    const isMember = channel.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    // Remove user from members
    channel.members = channel.members.filter(
      (member) => member.toString() !== userId
    );
    await channel.save();

    return res.status(200).json({
      success: true,
      message: "Successfully left the group",
    });
  } catch (error) {
    console.error("Error leaving channel:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateChannelDescription = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { description } = req.body;
    const userId = req.userId;

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is admin
    if (channel.admin.toString() !== userId) {
      return res.status(403).json({
        message: "Only admin can update group description",
      });
    }

    channel.description = description || "";
    await channel.save();

    return res.status(200).json({
      success: true,
      message: "Group description updated successfully",
      channel: {
        _id: channel._id,
        name: channel.name,
        description: channel.description,
      },
    });
  } catch (error) {
    console.error("Error updating channel description:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};