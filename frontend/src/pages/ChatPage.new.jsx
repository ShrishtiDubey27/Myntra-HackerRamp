import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";

const ChatPage = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, conversationsResponse] = await Promise.all([
          axios.get("/api/chat/users"),
          axios.get("/api/chat/conversations")
        ]);
        setUsers(usersResponse.data);
        setConversations(conversationsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (localStorage.getItem("userId")) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socket.emit("user_connected", userId);

    socket.on("user_status_changed", ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === "online") {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socket.on("receive_message", (message) => {
      if (activeConversation?._id === message.conversationId) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.emit("get_online_users");
    socket.on("online_users_list", (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    return () => {
      socket.off("user_status_changed");
      socket.off("receive_message");
      socket.off("online_users_list");
    };
  }, [socket, activeConversation]);

  const startChat = async (userId) => {
    try {
      const response = await axios.post("/api/chat/conversation", {
        participantId: userId
      });
      
      if (!conversations.find(c => c._id === response.data._id)) {
        setConversations(prev => [...prev, response.data]);
      }
      setActiveConversation(response.data);
      
      // Fetch messages for this conversation
      const messagesResponse = await axios.get(`/api/chat/messages/${response.data._id}`);
      setMessages(messagesResponse.data);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConversation) return;

    const messageData = {
      sender: localStorage.getItem("userId"),
      content: input.trim(),
      conversationId: activeConversation._id
    };

    socket.emit("send_message", messageData);
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, {
      ...messageData,
      _id: Date.now(),
      createdAt: new Date().toISOString()
    }]);
    
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 via-zinc-800 to-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <span className="font-bold text-lg">TrendTalks</span>
          <button
            onClick={() => navigate("/")}
            className="text-white text-xl font-bold hover:text-red-400 transition"
          >
            ✕
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => startChat(user._id)}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-lg mx-2 mb-1 ${
                activeConversation?.participants?.some(p => p._id === user._id) ? "bg-orange-500" : ""
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${
                  onlineUsers.has(user._id) ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium truncate">{user.name}</span>
                <span className="text-xs text-gray-400 truncate">{user.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b shadow-sm">
              <div className="font-semibold">
                {activeConversation.participants?.find(
                  p => p._id !== localStorage.getItem("userId")
                )?.name || "Chat"}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`flex ${msg.sender === localStorage.getItem('userId') ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[70%]">
                    <div className={`px-4 py-2 rounded-xl break-words ${
                      msg.sender === localStorage.getItem('userId')
                        ? "bg-orange-500 text-white"
                        : "bg-white shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-full disabled:opacity-50 hover:bg-orange-600 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;