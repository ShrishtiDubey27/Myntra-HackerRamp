// pages/ChatAI.jsx

// Stop voice recording handler
const handleStopRecording = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    setIsRecording(false);
  }
};

// Simple waveform animation component
const Waveform = () => (
  <div className="flex gap-1 items-center h-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="w-1 h-full bg-blue-400 animate-pulse"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import ChatBubble from "../components/ChatBubble.jsx";

const ChatAI = () => {
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      return JSON.parse(savedMessages).map((msg) => ({
        ...msg,
        time: new Date(msg.time),
      }));
    }
    return [
      {
        sender: "bot",
        text: "Hello! Ask me anything about fashion.",
        fallback: false,
        time: new Date(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesContainerRef = useRef(null);

  // Check for stylist context on component mount
  useEffect(() => {
    const stylistContext = sessionStorage.getItem("stylistChatContext");
    if (stylistContext) {
      try {
        const context = JSON.parse(stylistContext);

        // Add the original styling suggestion to chat history
        const originalSuggestionMessage = {
          sender: "bot",
          text: `Here's the styling suggestion I gave you for "${context.productName}":\n\n${context.suggestion}`,
          fallback: false,
          time: new Date(context.timestamp),
        };

        // Add welcome message with context
        const welcomeMessage = {
          sender: "bot",
          text: `I see you want to discuss this styling suggestion further! I'm here to help with more specific advice, different occasions, color combinations, or any styling questions you have. What would you like to know?`,
          fallback: false,
          time: new Date(),
        };

        // Add both messages to history
        setMessages((prev) => [
          ...prev,
          originalSuggestionMessage,
          welcomeMessage,
        ]);

        // Clear the context so it doesn't repeat
        sessionStorage.removeItem("stylistChatContext");
      } catch (error) {
        console.error("Error parsing stylist context:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Speech-to-text (voice input) ---
  const recognitionRef = useRef(null);
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
        // If final, stop recording
        if (event.results[event.results.length - 1].isFinal) {
          setIsRecording(false);
        }
      };
      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = () => setIsRecording(false);
    }
    recognitionRef.current.start();
  };

  // --- Text-to-speech (voice output) ---
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onpause = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePauseSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const addMessage = (newMsg) => {
    setMessages((prev) => {
      const updated = [...prev, newMsg].slice(-3);
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      fallback: false,
      time: new Date(),
    };
    addMessage(userMessage);
    setInput("");

    const contextMessages = [...messages, userMessage].slice(-3);

    try {
      const response = await axios.post("http://localhost:5000/api/chatAI", {
        prompt: input,
        context: contextMessages,
      });

      const botMessage = {
        sender: "bot",
        text: response.data.text,
        fallback: false,
        time: new Date(),
      };
      addMessage(botMessage);
      speak(response.data.text); // Speak bot response
    } catch (error) {
      console.error(error);
      addMessage({
        sender: "bot",
        text: "Oops! Something went wrong.",
        fallback: true,
        time: new Date(),
      });
    }
  };

  const handleClearHistory = () => {
    setInput("");
  };

  const handleClearChatHistory = () => {
    setMessages([
      {
        sender: "bot",
        text: "Hello! Ask me anything about fashion.",
        fallback: false,
        time: new Date(),
      },
    ]);
    localStorage.removeItem("chatHistory");
  };

  const handleStopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const recommendedQuestions = [
    "What outfit should I wear for a wedding?",
    "Latest fashion trends for summer?",
    "How to style a black dress?",
  ];

  return (
    <div className="flex flex-col h-[70vh] w-[80%] mx-auto mt-6 bg-white rounded-xl border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Heading with a Clear History button */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xl rounded-t-xl">
        <span>FashionGPT 👗</span>
        <button
          onClick={handleClearChatHistory}
          className="text-xs font-normal bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
        >
          Clear History
        </button>
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
          <ChatBubble key={idx} message={msg} />
        ))}
      </div>

      {/* Input box */}
      <form
        className="flex p-4 bg-white border-t border-gray-300 sticky bottom-0"
        onSubmit={sendMessage}
      >
        <input
          type="text"
          placeholder="Ask a fashion question..."
          className="flex-1 outline-none px-4 py-3 rounded-full border border-gray-300 focus:ring focus:ring-orange-500 focus:border-orange-500 mr-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="flex gap-2 items-center">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
          >
            Send
          </button>
          {isRecording ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="px-4 py-2 bg-red-500 text-white rounded-full animate-pulse cursor-not-allowed"
              >
                🎙️ Recording...
              </button>
              <Waveform />
              <button
                type="button"
                onClick={handleStopRecording}
                className="px-4 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-900 transition"
              >
                ⏹️ Stop
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleVoiceInput}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
            >
              🎤 Voice
            </button>
          )}
          <button
            type="button"
            onClick={handleClearHistory}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition"
          >
            Clear
          </button>
          {isSpeaking && (
            <button
              type="button"
              onClick={handlePauseSpeaking}
              className="px-4 py-2 bg-red-400 text-white rounded-full hover:bg-red-500 transition"
            >
              ⏸️ Pause
            </button>
          )}
        </div>
      </form>
      {isSpeaking && (
        <div style={{ color: "#007bff", marginTop: "8px" }}>
          🔊 AI is speaking...
        </div>
      )}
    </div>
  );
};

export default ChatAI;
