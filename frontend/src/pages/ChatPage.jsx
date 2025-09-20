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
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [directMessagesCollapsed, setDirectMessagesCollapsed] = useState(false);
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
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden fixed inset-0 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 text-gray-800 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-800">TrendTalks</span>
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 text-xl font-bold hover:text-orange-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col p-4 gap-3 border-b border-gray-200">
          <button
            onClick={() => setShowCreateChannelModal(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium"
          >
            ➕ Create Channel
          </button>
          <button
            onClick={() => setShowAddDMModal(true)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg transition flex items-center justify-center gap-2 font-medium border border-gray-300"
          >
            ➕ Add DM
          </button>
        </div>

        {/* Chat Lists */}
        <div className="flex-1 overflow-y-auto mt-2">
          {/* Channels */}
          <div
            className="p-3 text-gray-500 uppercase text-xs font-semibold cursor-pointer hover:bg-gray-100 rounded mx-2 flex items-center justify-between"
            onClick={() => setChannelsCollapsed(!channelsCollapsed)}
          >
            <span>Channels</span>
            <span className="text-lg">{channelsCollapsed ? "▶" : "▼"}</span>
          </div>
          {!channelsCollapsed &&
            channels.map((channel) => (
              <UnreadIndicator
                key={channel._id}
                contactId={channel._id}
                onMarkAsRead={handleMarkAsRead}
                chatType="channel"
                isSelected={
                  selectedChatType === "channel" &&
                  selectedChatData?._id === channel._id
                }
              >
                <div
                  onClick={() => handleContactSelect(channel, "channel")}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 rounded-lg mx-2 mb-1 truncate transition-colors ${
                    selectedChatType === "channel" &&
                    selectedChatData?._id === channel._id
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "text-gray-700"
                  }`}
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold">
                    #
                  </div>
                  <span className="truncate font-medium">{channel.name}</span>
                </div>
              </UnreadIndicator>
            ))}

          {/* Direct Messages */}
          <div
            className="p-3 text-gray-500 uppercase text-xs font-semibold mt-4 cursor-pointer hover:bg-gray-100 rounded mx-2 flex items-center justify-between"
            onClick={() => setDirectMessagesCollapsed(!directMessagesCollapsed)}
          >
            <span>Direct Messages</span>
            <span className="text-lg">
              {directMessagesCollapsed ? "▶" : "▼"}
            </span>
          </div>
          {!directMessagesCollapsed &&
            directMessagesContacts.map((contact) => (
              <UnreadIndicator
                key={contact._id}
                contactId={contact._id}
                onMarkAsRead={handleMarkAsRead}
                chatType="contact"
                isSelected={
                  selectedChatType === "contact" &&
                  selectedChatData?._id === contact._id
                }
              >
                <div
                  onClick={() => handleContactSelect(contact, "contact")}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 rounded-lg mx-2 mb-1 transition-colors ${
                    selectedChatType === "contact" &&
                    selectedChatData?._id === contact._id
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "text-gray-700"
                  }`}
                >
                  <ProfileImage user={contact} size="w-8 h-8" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">
                      {getDisplayName(contact)}
                    </span>
                    {contact.lastMessage && (
                      <span className="text-xs text-gray-500 truncate">
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
            <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-white">
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
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-200">
                <span className="text-orange-500 text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to TrendTalks
              </h3>
              <p className="text-gray-600">
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
