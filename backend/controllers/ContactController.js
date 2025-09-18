import mongoose from "mongoose";
import ChatUser from "../models/ChatUserModel.js";
import Message from "../models/MessagesModel.js";

export const getAllContacts = async (request, response, next) => {
  try {
    const users = await ChatUser.find(
      { _id: { $ne: request.userId } },
      "firstName lastName _id email image color name"
    );

    const contacts = users.map((user) => ({
      label: user.firstName
        ? `${user.firstName} ${user.lastName}`
        : user.name || user.email,
      value: user._id,
      email: user.email,
      image: user.image,
      color: user.color,
      name: user.name,
    }));

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};

export const searchContacts = async (request, response, next) => {
  try {
    const { searchTerm } = request.body;

    if (searchTerm === undefined || searchTerm === null) {
      return response.status(400).send("Search Term is required.");
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await ChatUser.find({
      $and: [
        { _id: { $ne: request.userId } },
        {
          $or: [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { name: regex },
          ],
        },
      ],
    }).select("firstName lastName email _id image color name");

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error.");
  }
};

export const getContactsForList = async (req, res, next) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);

    if (!userId) {
      return res.status(400).send("User ID is required.");
    }
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
          name: "$contactInfo.name",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error getting user contacts:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req;
    const { isOnline } = req.body;

    await ChatUser.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    });

    return res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const onlineUsers = await ChatUser.find({ isOnline: true }, "_id");

    const onlineUserIds = onlineUsers.map((user) => user._id.toString());

    return res.status(200).json({ onlineUsers: onlineUserIds });
  } catch (error) {
    console.error("Error getting online users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
