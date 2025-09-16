import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // npm install date-fns

const ChatAI = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything about fashion.', fallback: false, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef(null);

  const recommendedQuestions = [
    "What outfit should I wear for a wedding?",
    "Latest fashion trends for summer?",
    "How to style a black dress?",
  ];

  // Scroll to top on first render
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input, fallback: false, time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post("http://localhost:5000/api/chatAI", { prompt: input });
      const botMessage = {
        sender: 'bot',
        text: response.data.text,
        fallback: false,
        time: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Oops! Something went wrong.', fallback: true, time: new Date() }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] w-[80%] mx-auto mt-6 bg-white rounded-xl border border-gray-200
                    shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">

      {/* Heading */}
      <div className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xl rounded-t-xl">
        FashionGPT 👗
      </div>

      {/* Recommended questions */}
      <div className="flex gap-2 overflow-x-auto p-2 bg-gray-100 border-b border-gray-200">
        {recommendedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInput(q)}
            className="flex-shrink-0 px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="flex-shrink-0 mr-2">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                  B
                </div>
              </div>
            )}
            <div
              className={`px-5 py-3 rounded-2xl max-w-[75%] break-words ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : msg.fallback
                    ? 'bg-yellow-100 text-yellow-800 italic'
                    : 'bg-gray-200 text-gray-900'
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {format(new Date(msg.time), 'hh:mm a')}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  U
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input box */}
      <form className="flex p-4 bg-white border-t border-gray-300 sticky bottom-0" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Ask a fashion question..."
          className="flex-1 outline-none px-4 py-3 rounded-full border border-gray-300 focus:ring focus:ring-orange-500 focus:border-orange-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="ml-3 px-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatAI;
