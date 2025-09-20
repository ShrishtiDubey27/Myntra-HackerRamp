import { Router } from "express";
import {
  createPoll,
  voteOnPoll,
  removeVote,
  getPollResults,
  getPoll,
  getChatPolls
} from "../controllers/pollController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";

const pollRoutes = Router();

// Create a new poll
pollRoutes.post("/create", verifyToken, createPoll);

// Vote on a poll
pollRoutes.post("/vote", verifyToken, voteOnPoll);

// Remove vote from a poll
pollRoutes.post("/remove-vote", verifyToken, removeVote);

// Get poll results
pollRoutes.get("/:pollId/results", verifyToken, getPollResults);

// Get poll details
pollRoutes.get("/:pollId", verifyToken, getPoll);

// Get all polls for a chat/channel
pollRoutes.get("/chat/:chatType/:chatId", verifyToken, getChatPolls);

export default pollRoutes;