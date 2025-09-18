import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import ChatUser from "../models/ChatUserModel.js";
import bcrypt from "bcrypt";

export const syncUserToChatDB = async (req, res) => {
  try {
    const { token, firstName, lastName, image } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user exists in chat database
    let chatUser = await ChatUser.findOne({ email: user.email });

    if (!chatUser) {
      // Create user in chat database
      chatUser = await ChatUser.create({
        name: user.name,
        email: user.email,
        password: user.password, // Already hashed
        image: image || "",
        firstName: firstName || user.name.split(" ")[0] || "",
        lastName: lastName || user.name.split(" ").slice(1).join(" ") || "",
        profileSetup: true,
        color: Math.floor(Math.random() * 6),
      });
    } else {
      // Update existing chat user with new profile info
      chatUser = await ChatUser.findByIdAndUpdate(
        chatUser._id,
        {
          firstName: firstName || chatUser.firstName,
          lastName: lastName || chatUser.lastName,
          image: image || chatUser.image,
          profileSetup: true,
        },
        { new: true }
      );
    }

    // Create JWT token for chat
    const chatToken = jwt.sign(
      { email: chatUser.email, userId: chatUser._id },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    res.cookie("jwt", chatToken, {
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    res.json({
      success: true,
      chatToken: chatToken, // Return the chat token
      user: {
        id: chatUser._id,
        email: chatUser.email,
        firstName: chatUser.firstName,
        lastName: chatUser.lastName,
        image: chatUser.image,
        profileSetup: chatUser.profileSetup,
        color: chatUser.color,
      },
    });
  } catch (error) {
    console.log("Sync error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
