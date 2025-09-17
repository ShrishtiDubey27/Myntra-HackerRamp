const express = require('express');
const router = express.Router();
const { getChatResponse } = require('../controllers/chatControllers');

// Define the single route for getting a chat response
router.post('/', getChatResponse);

module.exports = router;