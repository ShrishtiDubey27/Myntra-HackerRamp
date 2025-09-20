import mongoose from "mongoose";
import chatDb from "../config/chatdb.js";

const pollOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  votes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    options: [pollOptionSchema],
    pollType: {
      type: String,
      enum: [
        "fashion_trend",
        "outfit_choice",
        "color_preference",
        "style_rating",
        "general",
      ],
      default: "fashion_trend",
    },
    category: {
      type: String,
      enum: [
        "dress",
        "shoes",
        "accessories",
        "tops",
        "bottoms",
        "formal",
        "casual",
        "party",
        "general",
      ],
      default: "general",
    },
    allowMultipleVotes: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: String,
      enum: ["after_voting", "always", "after_end"],
      default: "after_voting",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    // For chat/channel context
    chatType: {
      type: String,
      enum: ["direct", "channel"],
      required: true,
    },
    chatId: {
      type: String, // Can be recipient ID for direct chat or channel ID
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
pollSchema.index({ chatId: 1, chatType: 1 });
pollSchema.index({ creator: 1 });
pollSchema.index({ createdAt: -1 });
pollSchema.index({ expiresAt: 1 });

// Virtual for checking if poll is expired
pollSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

// Method to add a vote
pollSchema.methods.addVote = function (userId, optionId) {
  console.log("Looking for option ID:", optionId);
  console.log(
    "Available options:",
    this.options.map((opt) => ({ id: opt.id, text: opt.text }))
  );

  const option = this.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw new Error("Option not found");
  }

  // Check if user already voted
  if (!this.allowMultipleVotes) {
    const hasVoted = this.options.some((opt) =>
      opt.votes.some((vote) => vote.userId.toString() === userId.toString())
    );
    if (hasVoted) {
      throw new Error("User has already voted on this poll");
    }
  } else {
    // Check if user already voted on this specific option
    const hasVotedOnOption = option.votes.some(
      (vote) => vote.userId.toString() === userId.toString()
    );
    if (hasVotedOnOption) {
      throw new Error("User has already voted on this option");
    }
  }

  // Add vote
  option.votes.push({ userId });
  option.voteCount = option.votes.length;

  // Update total votes
  this.totalVotes = this.options.reduce(
    (total, opt) => total + opt.voteCount,
    0
  );

  return this.save();
};

// Method to remove a vote
pollSchema.methods.removeVote = function (userId, optionId) {
  const option = this.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw new Error("Option not found");
  }

  // Remove vote
  option.votes = option.votes.filter(
    (vote) => vote.userId.toString() !== userId.toString()
  );
  option.voteCount = option.votes.length;

  // Update total votes
  this.totalVotes = this.options.reduce(
    (total, opt) => total + opt.voteCount,
    0
  );

  return this.save();
};

// Method to get poll results
pollSchema.methods.getResults = function () {
  return this.options.map((option) => ({
    id: option.id,
    text: option.text,
    imageUrl: option.imageUrl,
    voteCount: option.voteCount,
    percentage:
      this.totalVotes > 0
        ? Math.round((option.voteCount / this.totalVotes) * 100)
        : 0,
  }));
};

// Method to check if user can see results
pollSchema.methods.canUserSeeResults = function (userId) {
  if (this.showResults === "always") return true;
  if (this.showResults === "after_end" && this.isExpired) return true;
  if (this.showResults === "after_voting") {
    // Check if user has voted
    return this.options.some((option) =>
      option.votes.some((vote) => vote.userId.toString() === userId.toString())
    );
  }
  return false;
};

const Poll = chatDb.model("Poll", pollSchema);
export default Poll;
