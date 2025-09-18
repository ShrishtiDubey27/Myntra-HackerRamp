import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import { useNavigate } from "react-router-dom";
import { ChatProvider, useChatContext } from "../context/ChatContext.jsx";
import AddDMModal from "../components/AddDMModal";
import CreateChannelModal from "../components/CreateChannelModal";
import ProfileSection from "../components/ProfileSection";
import MessageInput from "../components/MessageInput.jsx";
import MessageComponent from "../components/MessageComponent.jsx";
import UnreadIndicator from "../components/UnreadIndicator.jsx";
import ProfileImage from "../components/ProfileImage.jsx";
import {
  getContactsForDMList,
  getUserChannels,
  getMessages,
  getChannelMessages,
} from "../utils/chatAPI.js";

const ChatContent = () => {
  const navigate = useNavigate();
  const {
    chatUser,
    selectedChatType,
    setSelectedChatType,
    selectedChatData,
    setSelectedChatData,
    selectedChatMessages,
    setSelectedChatMessages,
    directMessagesContacts,
    setDirectMessagesContacts,
    channels,
    setChannels,
    socket,
    markChatAsRead,
  } = useChatContext();

  const [showAddDMModal, setShowAddDMModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!chatUser) return;

      setIsLoading(true);
      try {
        // Fetch DM contacts and channels
        const [dmResponse, channelsResponse] = await Promise.all([
          getContactsForDMList(),
          getUserChannels(),
        ]);

        setDirectMessagesContacts(dmResponse.contacts || []);
        setChannels(channelsResponse.channels || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chatUser]);

  // Scroll to bottom when messages change or chat is selected
  useEffect(() => {
    scrollToBottom();
  }, [selectedChatMessages, selectedChatData]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Alternative immediate scroll function
  const scrollToBottomImmediate = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const handleContactSelect = async (contact, type) => {
    setSelectedChatType(type);
    setSelectedChatData(contact);

    try {
      if (type === "contact") {
        const response = await getMessages(contact._id);
        setSelectedChatMessages(response.messages || []);
      } else if (type === "channel") {
        const response = await getChannelMessages(contact._id);
        setSelectedChatMessages(response.messages || []);
      }

      // Force scroll to bottom after a short delay to ensure messages are rendered
      setTimeout(() => {
        scrollToBottomImmediate(); // Use immediate scroll for new chat opening
      }, 100);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setSelectedChatMessages([]);
    }
  };

  // Separate function to handle marking messages as read when chat is opened
  const handleChatOpened = (contactId) => {
    if (markChatAsRead) {
      markChatAsRead(contactId);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socket.current) return;

    const messageData = {
      content: input,
      messageType: "text",
      timestamp: new Date(),
    };

    if (selectedChatType === "contact") {
      socket.current.emit("sendMessage", {
        ...messageData,
        sender: chatUser.id,
        recipient: selectedChatData._id,
      });
    } else if (selectedChatType === "channel") {
      socket.current.emit("send-channel-message", {
        ...messageData,
        sender: chatUser.id,
        channelId: selectedChatData._id,
      });
    }
  };

  const handleAddDM = (contact) => {
    // Add to DM list if not already present
    const exists = directMessagesContacts.find((c) => c._id === contact._id);
    if (!exists) {
      const newContact = {
        ...contact,
        lastMessage: null,
      };
      setDirectMessagesContacts((prev) => [newContact, ...prev]);
    }

    // Select the contact
    handleContactSelect(contact, "contact");
  };

  const handleChannelCreated = (channel) => {
    setChannels((prev) => [channel, ...prev]);
    handleContactSelect(channel, "channel");

    // Notify other users
    if (socket.current) {
      socket.current.emit("add-channel-notify", channel);
    }
  };

  const handleMarkAsRead = (senderId) => {
    // This will be called when user clicks on a chat to open it
    handleChatOpened(senderId);
  };

  const getDisplayName = (contact) => {
    if (contact.firstName && contact.lastName) {
      return `${contact.firstName} ${contact.lastName}`;
    }
    if (contact.name) {
      return contact.name;
    }
    return contact.email || "Unknown";
  };

  const getContactAvatar = (contact) => {
    if (contact.image) {
      return (
        <img
          src={contact.image}
          alt={getDisplayName(contact)}
          className="w-8 h-8 rounded-full"
        />
      );
    }

    const avatarColors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const colorClass = avatarColors[contact.color] || "bg-gray-500";
    const initials = getDisplayName(contact)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${colorClass}`}
      >
        {initials}
      </div>
    );
  };

  if (!chatUser) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

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

        {/* Action Buttons */}
        <div className="flex flex-col p-2 gap-2 border-b">
          <button
            onClick={() => setShowCreateChannelModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            ➕ Create Channel
          </button>
          <button
            onClick={() => setShowAddDMModal(true)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            ➕ Add DM
          </button>
        </div>

        {/* Chat Lists */}
        <div className="flex-1 overflow-y-auto mt-2">
          {/* Channels */}
          <div className="p-3 text-gray-400 uppercase text-xs">Channels</div>
          {channels.map((channel) => (
            <UnreadIndicator
              key={channel._id}
              contactId={channel._id}
              onMarkAsRead={handleMarkAsRead}
              isSelected={
                selectedChatType === "channel" &&
                selectedChatData?._id === channel._id
              }
            >
              <div
                onClick={() => handleContactSelect(channel, "channel")}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-lg mx-2 mb-1 truncate ${
                  selectedChatType === "channel" &&
                  selectedChatData?._id === channel._id
                    ? "bg-orange-500 text-white"
                    : "text-gray-300"
                }`}
              >
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  #
                </div>
                <span className="truncate">{channel.name}</span>
              </div>
            </UnreadIndicator>
          ))}

          {/* Direct Messages */}
          <div className="p-3 text-gray-400 uppercase text-xs mt-4">
            Direct Messages
          </div>
          {directMessagesContacts.map((contact) => (
            <UnreadIndicator
              key={contact._id}
              contactId={contact._id}
              onMarkAsRead={handleMarkAsRead}
              isSelected={
                selectedChatType === "contact" &&
                selectedChatData?._id === contact._id
              }
            >
              <div
                onClick={() => handleContactSelect(contact, "contact")}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded-lg mx-2 mb-1 ${
                  selectedChatType === "contact" &&
                  selectedChatData?._id === contact._id
                    ? "bg-orange-500 text-white"
                    : "text-gray-300"
                }`}
              >
                <ProfileImage user={contact} size="w-8 h-8" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">
                    {getDisplayName(contact)}
                  </span>
                  {contact.lastMessage && (
                    <span className="text-xs text-gray-400 truncate">
                      {contact.lastMessage.content || "File"}
                    </span>
                  )}
                </div>
              </div>
            </UnreadIndicator>
          ))}
        </div>

        {/* Profile Section */}
        <ProfileSection />
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1">
        {selectedChatData ? (
          <>
            <ChatHeader
              activeChat={{
                name:
                  selectedChatType === "channel"
                    ? selectedChatData.name
                    : getDisplayName(selectedChatData),
                type: selectedChatType,
                ...selectedChatData,
              }}
              updateGroupInfo={() => {}}
            />

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-gray-50">
              {selectedChatMessages.map((msg) => (
                <MessageComponent
                  key={msg._id}
                  message={msg}
                  isChannel={selectedChatType === "channel"}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              selectedChatData={selectedChatData}
              selectedChatType={selectedChatType}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to TrendTalks
              </h3>
              <p className="text-gray-500">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDMModal
        isOpen={showAddDMModal}
        onClose={() => setShowAddDMModal(false)}
        onAddContact={handleAddDM}
      />

      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  );
};

const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
