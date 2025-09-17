const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Google Generative AI client with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Get a response from the Gemini AI model
 * @route   POST /api/chat
 * @access  Public
 */
const getChatResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error('Prompt is required');
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Add context to make it a specialized "FashionGPT"
    const fullPrompt = `
      You are FashionGPT, a friendly and stylish AI assistant for the Shopaura e-commerce store.
      Your goal is to provide helpful and inspiring fashion advice based on user questions.
      Keep your answers concise and relevant to fashion.
      User's question: "${prompt}"
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Something went wrong with the AI service.' });
  }
};

module.exports = { getChatResponse };