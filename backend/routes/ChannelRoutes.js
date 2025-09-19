import { Router } from "express";
import {
  createChannel,
  getChannelMessages,
  getUserChannels,
  getAllChannels,
  getChannelDetails,
  leaveChannel,
  updateChannelDescription,
} from "../controllers/ChannelController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);
channelRoutes.get("/get-all-channels", verifyToken, getAllChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages
);
channelRoutes.get(
  "/get-channel-details/:channelId",
  verifyToken,
  getChannelDetails
);
channelRoutes.post("/leave-channel/:channelId", verifyToken, leaveChannel);
channelRoutes.put(
  "/update-description/:channelId",
  verifyToken,
  updateChannelDescription
);

export default channelRoutes;