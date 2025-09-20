import express from "express";
import { generateOutfitSuggestion } from "../controllers/outfitController.js";

const outfitRouter = express.Router();

// POST route for generating outfit suggestions
outfitRouter.post("/generate-suggestion", generateOutfitSuggestion);

export default outfitRouter;
