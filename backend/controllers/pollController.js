import Poll from "../models/pollModel.js";
import Message from "../models/MessagesModel.js";
import { v4 as uuidv4 } from "uuid";

export const createPoll = async (req, res) => {
  try {
    const {
      title,
      description,
      options,
      pollType,
      category,
      allowMultipleVotes,
      showResults,
      expiresIn,
      chatType,
      chatId,
      recipient // for direct messages
    } = req.body;

    const creatorId = req.userId;

    if (!title || !options || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Poll must have a title and at least 2 options"
      });
    }

    if (options.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Poll cannot have more than 10 options"
      });
    }

    // Calculate expiry date
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000) // hours to milliseconds
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

    // Format options with unique IDs
    const formattedOptions = options.map(option => ({
      id: uuidv4(),
      text: option.text,
      imageUrl: option.imageUrl || "",
      votes: [],
      voteCount: 0
    }));

    // Create poll
    const poll = new Poll({
      creator: creatorId,
      title,
      description: description || "",
      options: formattedOptions,
      pollType: pollType || "fashion_trend",
      category: category || "general",
      allowMultipleVotes: allowMultipleVotes || false,
      showResults: showResults || "after_voting",
      expiresAt,
      chatType: chatType || "direct",
      chatId: chatId || recipient,
      totalVotes: 0
    });

    const savedPoll = await poll.save();
    console.log('Saved poll options:', savedPoll.options.map(opt => ({ id: opt.id, text: opt.text })));

    // Create a message for the poll
    const pollMessage = new Message({
      sender: creatorId,
      recipient: chatType === "direct" ? recipient : null,
      messageType: "poll",
      pollId: savedPoll._id,
      pollData: {
        title: savedPoll.title,
        description: savedPoll.description,
        options: savedPoll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          imageUrl: opt.imageUrl
        })),
        pollType: savedPoll.pollType,
        category: savedPoll.category,
        allowMultipleVotes: savedPoll.allowMultipleVotes,
        expiresAt: savedPoll.expiresAt
      },
      isRead: false,
      messageStatus: "sent"
    });

    console.log('Poll message data:', pollMessage.pollData.options.map(opt => ({ id: opt.id, text: opt.text })));
    const savedMessage = await pollMessage.save();

    // Update poll with message ID
    savedPoll.messageId = savedMessage._id;
    await savedPoll.save();

    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: savedPoll,
      messageId: savedMessage._id
    });

  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const voteOnPoll = async (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    const userId = req.userId;

    console.log("Vote request data:", { pollId, optionId, userId });
    console.log("Request body:", req.body);

    if (!pollId || !optionId) {
      return res.status(400).json({
        success: false,
        message: "Poll ID and option ID are required"
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found"
      });
    }

    console.log('Found poll with options:', poll.options.map(opt => ({ id: opt.id, text: opt.text })));

    // Check if poll is expired
    if (poll.isExpired) {
      return res.status(400).json({
        success: false,
        message: "Poll has expired"
      });
    }

    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({
        success: false,
        message: "Poll is not active"
      });
    }

    try {
      await poll.addVote(userId, optionId);
      
      const updatedPoll = await Poll.findById(pollId).populate('creator', 'firstName lastName');
      
      res.status(200).json({
        success: true,
        message: "Vote recorded successfully",
        poll: updatedPoll
      });

    } catch (voteError) {
      console.error("Vote error:", voteError.message);
      return res.status(400).json({
        success: false,
        message: voteError.message
      });
    }

  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const removeVote = async (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    const userId = req.userId;

    if (!pollId || !optionId) {
      return res.status(400).json({
        success: false,
        message: "Poll ID and option ID are required"
      });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found"
      });
    }

    try {
      await poll.removeVote(userId, optionId);
      
      const updatedPoll = await Poll.findById(pollId).populate('creator', 'firstName lastName');
      
      res.status(200).json({
        success: true,
        message: "Vote removed successfully",
        poll: updatedPoll
      });

    } catch (voteError) {
      return res.status(400).json({
        success: false,
        message: voteError.message
      });
    }

  } catch (error) {
    console.error("Error removing vote:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.userId;

    const poll = await Poll.findById(pollId).populate('creator', 'firstName lastName');
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found"
      });
    }

    // Check if user can see results
    if (!poll.canUserSeeResults(userId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot view results yet"
      });
    }

    const results = poll.getResults();

    res.status(200).json({
      success: true,
      poll: {
        _id: poll._id,
        title: poll.title,
        description: poll.description,
        creator: poll.creator,
        totalVotes: poll.totalVotes,
        isExpired: poll.isExpired,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt
      },
      results
    });

  } catch (error) {
    console.error("Error getting poll results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.userId;

    const poll = await Poll.findById(pollId).populate('creator', 'firstName lastName');
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found"
      });
    }

    // Check if user has voted
    const userVotes = [];
    poll.options.forEach(option => {
      const userVote = option.votes.find(vote => 
        vote.userId.toString() === userId.toString()
      );
      if (userVote) {
        userVotes.push({
          optionId: option.id,
          votedAt: userVote.votedAt
        });
      }
    });

    const canSeeResults = poll.canUserSeeResults(userId);

    res.status(200).json({
      success: true,
      poll: {
        _id: poll._id,
        title: poll.title,
        description: poll.description,
        creator: poll.creator,
        options: poll.options.map(option => ({
          id: option.id,
          text: option.text,
          imageUrl: option.imageUrl,
          voteCount: canSeeResults ? option.voteCount : undefined,
          percentage: canSeeResults && poll.totalVotes > 0 
            ? Math.round((option.voteCount / poll.totalVotes) * 100) 
            : undefined
        })),
        pollType: poll.pollType,
        category: poll.category,
        allowMultipleVotes: poll.allowMultipleVotes,
        totalVotes: canSeeResults ? poll.totalVotes : undefined,
        isExpired: poll.isExpired,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        canSeeResults,
        userVotes
      }
    });

  } catch (error) {
    console.error("Error getting poll:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getChatPolls = async (req, res) => {
  try {
    const { chatId, chatType } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const polls = await Poll.find({
      chatId,
      chatType
    })
    .populate('creator', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const pollsWithUserData = polls.map(poll => {
      const userVotes = [];
      poll.options.forEach(option => {
        const userVote = option.votes.find(vote => 
          vote.userId.toString() === userId.toString()
        );
        if (userVote) {
          userVotes.push({
            optionId: option.id,
            votedAt: userVote.votedAt
          });
        }
      });

      const canSeeResults = poll.canUserSeeResults(userId);

      return {
        _id: poll._id,
        title: poll.title,
        description: poll.description,
        creator: poll.creator,
        options: poll.options.map(option => ({
          id: option.id,
          text: option.text,
          imageUrl: option.imageUrl,
          voteCount: canSeeResults ? option.voteCount : undefined,
          percentage: canSeeResults && poll.totalVotes > 0 
            ? Math.round((option.voteCount / poll.totalVotes) * 100) 
            : undefined
        })),
        pollType: poll.pollType,
        category: poll.category,
        allowMultipleVotes: poll.allowMultipleVotes,
        totalVotes: canSeeResults ? poll.totalVotes : undefined,
        isExpired: poll.isExpired,
        expiresAt: poll.expiresAt,
        createdAt: poll.createdAt,
        canSeeResults,
        userVotes
      };
    });

    res.status(200).json({
      success: true,
      polls: pollsWithUserData,
      pagination: {
        currentPage: parseInt(page),
        totalPolls: await Poll.countDocuments({ chatId, chatType }),
        hasMore: polls.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error getting chat polls:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
