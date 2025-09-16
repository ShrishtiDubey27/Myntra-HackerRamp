import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [channels, setChannels] = useState([
    { id: 1, name: "HipHop Vibes Lounge", avatar: "https://i.pravatar.cc/40?img=1", description: "Let's vibe to hiphop beats" },
    { id: 2, name: "GENZ Squad ✨", avatar: "https://i.pravatar.cc/40?img=2", description: "GenZ talk zone" },
    { id: 3, name: "Goth Aesthetic", avatar: "https://i.pravatar.cc/40?img=3", description: "Dark vibes and aesthetics" },
    { id: 4, name: "Girly Talk 💅", avatar: "https://i.pravatar.cc/40?img=4", description: "Fun girly chat" },
    { id: 5, name: "Couture Collective 👗", avatar: "https://i.pravatar.cc/40?img=5", description: "Fashion discussions" },
  ]);

  const [contacts, setContacts] = useState([
    { id: 6, name: "Arjun Mehta", lastMessage: "Yo what's up?", avatar: "https://i.pravatar.cc/40?img=6" },
    { id: 7, name: "Priya Sharma", lastMessage: "Let's meet tomorrow!", avatar: "https://i.pravatar.cc/40?img=7" },
    { id: 8, name: "Rohan Kapoor", lastMessage: "Did you check that link?", avatar: "https://i.pravatar.cc/40?img=8" },
    { id: 9, name: "Ananya Rao", lastMessage: "Haha that's funny 😂", avatar: "https://i.pravatar.cc/40?img=9" },
    { id: 10, name: "Vikram Singh", lastMessage: "Working on project rn...", avatar: "https://i.pravatar.cc/40?img=10" },
  ]);

  const [activeChat, setActiveChat] = useState(channels[0]);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Welcome to HipHop Vibes Lounge 🎶" },
    { id: 2, sender: "me", text: "Hey, let's vibe!" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { id: Date.now(), sender: "me", text: input };
    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now(), sender: "bot", text: `Replying in ${activeChat.name} ✨` }]);
    }, 1000);
  };

  const updateGroupInfo = () => {
    const name = prompt("Update group/contact name:", activeChat.name);
    const desc = activeChat.type === "channel" ? prompt("Update description:", activeChat.description) : "";
    setActiveChat((prev) => ({ ...prev, name: name || prev.name, description: desc || prev.description }));
    if (activeChat.type === "channel") {
      setChannels((prev) =>
        prev.map((ch) => (ch.id === activeChat.id ? { ...ch, name: name || ch.name, description: desc || ch.description } : ch))
      );
    } else {
      setContacts((prev) => prev.map((c) => (c.id === activeChat.id ? { ...c, name: name || c.name } : c)));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden fixed inset-0 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 via-zinc-800 to-gray-800 text-white flex flex-col shadow-lg">
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-bold text-lg">TrendTalks</span>
          <button
            onClick={() => navigate("/")}
            className="text-white text-xl font-bold hover:text-red-400 transition"
          >
            ✕
          </button>
        </div>

        {/* Create Group / Add DM Buttons */}
        <div className="flex flex-col p-2 gap-2 border-b">
          <button
            onClick={() => {
              const name = prompt("Enter new group name:");
              if (name)
                setChannels([
                  ...channels,
                  { id: Date.now(), name, avatar: "https://i.pravatar.cc/40?img=11", description: "" },
                ]);
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
          >
            ➕ Create Group
          </button>
          <button
            onClick={() => {
              const name = prompt("Enter contact name:");
              if (name) setContacts([...contacts, { id: Date.now(), name, lastMessage: "", avatar: "https://i.pravatar.cc/40?img=12" }]);
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
          >
            ➕ Add DM
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto mt-2">
          <div className="p-3 text-gray-400 uppercase text-xs">Groups</div>
          {channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveChat({ ...ch, type: "channel" })}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-lg mx-2 mb-1 truncate ${
                activeChat.type === "channel" && activeChat.id === ch.id ? "bg-orange-500 text-white" : "text-gray-300"
              }`}
            >
              <img src={ch.avatar} alt={ch.name} className="w-8 h-8 rounded-full" />
              <span className="truncate">{ch.name}</span>
            </div>
          ))}

          <div className="p-3 text-gray-400 uppercase text-xs mt-4">Direct Messages</div>
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveChat({ ...c, type: "dm" })}
              className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-lg mx-2 mb-1 ${
                activeChat.type === "dm" && activeChat.id === c.id ? "bg-orange-500 text-white" : "text-gray-300"
              }`}
            >
              <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full" />
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium truncate">{c.name}</span>
                <span className="text-xs text-gray-400 truncate">{c.lastMessage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1">
        <ChatHeader activeChat={activeChat} updateGroupInfo={updateGroupInfo} />

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2 rounded-xl max-w-xs break-words shadow-sm ${
                  msg.sender === "me" ? "bg-orange-500 text-white" : "bg-white text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white flex items-center border-t gap-2 shadow-inner">
          <button className="p-2 hover:bg-gray-100 rounded-full">📎</button>
          <button className="p-2 hover:bg-gray-100 rounded-full">🖼️</button>
          <button className="p-2 hover:bg-gray-100 rounded-full">🎤</button>
          <button className="p-2 hover:bg-gray-100 rounded-full">😀</button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activeChat.name}`}
            className="flex-1 p-2 mx-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          {input.trim() !== "" && (
            <button
              onClick={sendMessage}
              className="ml-2 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition"
            >
              ➤
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
