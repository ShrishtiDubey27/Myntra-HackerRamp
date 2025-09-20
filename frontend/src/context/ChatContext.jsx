import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { ShopContext } from "./ShopContext.jsx";
import axios from "axios";

const ChatContext = createContext();

export { ChatContext };

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [chatUser, setChatUser] = useState(null);
  const [chatToken, setChatToken] = useState(null);
  const [selectedChatType, setSelectedChatType] = useState(undefined);
  const [selectedChatData, setSelectedChatData] = useState(undefined);
  const [selectedChatMessages, setSelectedChatMessages] = useState([]);
  const [directMessagesContacts, setDirectMessagesContacts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [fileDownloadProgress, setFileDownloadProgress] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({}); // Global unread count state
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users

  const socket = useRef();

  // Sync user with chat database when token changes
  useEffect(() => {
    const syncUser = async () => {
      if (token && backendUrl) {
        try {
          const response = await axios.post(
            `${backendUrl}/api/chat/sync-user`,
            {
              token,
            },
            {
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setChatUser(response.data.user);
            setChatToken(response.data.chatToken || token); // Use chat-specific token if available, fallback to ecom token
          }
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncUser();
  }, [token, backendUrl]);

  // Initialize socket connection
  useEffect(() => {
    if (chatUser) {
      socket.current = io(backendUrl, {
        withCredentials: true,
        query: { userId: chatUser.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to server");
        // Fetch initial unread counts after connection
        fetchUnreadCounts();
        // Fetch initial online users
        fetchOnlineUsers();
      });

      const handleReceiveMessage = (message) => {
        console.log("Received message:", message);

        // Add message to the conversation if it's the currently selected chat
        if (
          selectedChatType !== undefined &&
          selectedChatData &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          setSelectedChatMessages((prev) => [...prev, message]);

          // Only mark as read if this is the actively viewed chat AND it's not our own message
          if (message.sender._id !== chatUser?.id && socket.current) {
            socket.current.emit("markAsRead", {
              senderId: message.sender._id,
              recipientId: chatUser.id,
            });

            // Clear unread count for this chat since we're viewing it
            setUnreadCounts((prev) => ({
              ...prev,
              [message.sender._id]: 0,
            }));
          }
        } else {
          // Message is NOT for currently selected chat, so increment unread count
          if (message.sender._id !== chatUser?.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [message.sender._id]: (prev[message.sender._id] || 0) + 1,
            }));
            console.log(
              "Incremented unread count for sender:",
              message.sender._id
            );
          }
        }

        // Update the DM list with the latest message
        setDirectMessagesContacts((prev) =>
          prev.map((contact) =>
            contact._id === message.sender._id
              ? { ...contact, lastMessage: message }
              : contact
          )
        );
      };

      const handleReceiveChannelMessage = (message) => {
        console.log("Received channel message:", message);

        // Add message to the conversation if it's the currently selected channel
        if (
          selectedChatType === "channel" &&
          selectedChatData &&
          selectedChatData._id === message.channelId
        ) {
          setSelectedChatMessages((prev) => [...prev, message]);

          // Only mark as read if this is the actively viewed channel AND it's not our own message
          if (message.sender._id !== chatUser?.id && socket.current) {
            // For channels, we don't emit markAsRead since channels don't have traditional read receipts
            // But we clear the unread count locally since user is viewing it
            setUnreadCounts((prev) => ({
              ...prev,
              [message.channelId]: 0,
            }));
          }
        } else {
          // Message is NOT for currently selected channel, so increment unread count
          if (message.sender._id !== chatUser?.id) {
            setUnreadCounts((prev) => ({
              ...prev,
              [message.channelId]: (prev[message.channelId] || 0) + 1,
            }));
            console.log(
              "Incremented unread count for channel:",
              message.channelId
            );
          }
        }
      };

      const handleNewChannelAdded = (channel) => {
        setChannels((prev) => [channel, ...prev]);
      };

      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("recieve-channel-message", handleReceiveChannelMessage);
      socket.current.on("new-channel-added", handleNewChannelAdded);

      // Handle unread count updates from server
      socket.current.on("unreadCountUpdate", ({ senderId, count }) => {
        console.log("Received unread count update:", { senderId, count });
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: count,
        }));
      });

      // Handle user online/offline status
      socket.current.on("userOnline", (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socket.current.on("userOffline", (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [chatUser, selectedChatData, selectedChatType, backendUrl]);

  const closeChat = () => {
    setSelectedChatData(undefined);
    setSelectedChatType(undefined);
    setSelectedChatMessages([]);
  };

  const fetchUnreadCounts = async () => {
    if (!chatToken) return;

    try {
      const response = await axios.get(
        `${backendUrl}/api/chat/messages/unread-counts`,
        {
          headers: {
            Authorization: `Bearer ${chatToken}`,
          },
        }
      );

      if (response.data.unreadCounts) {
        const counts = {};
        response.data.unreadCounts.forEach((item) => {
          counts[item._id] = item.count;
        });
        setUnreadCounts(counts);
        console.log("Fetched initial unread counts:", counts);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  const fetchOnlineUsers = async () => {
    if (!chatToken) return;

    try {
      const response = await axios.get(
        `${backendUrl}/api/chat/contacts/online`,
        {
          headers: {
            Authorization: `Bearer ${chatToken}`,
          },
        }
      );

      if (response.data.onlineUsers) {
        setOnlineUsers(new Set(response.data.onlineUsers));
        console.log("Fetched online users:", response.data.onlineUsers);
      }
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };

  const markChatAsRead = async (chatId, chatType = null) => {
    if (!chatToken || !chatUser) return;

    try {
      // Determine chat type if not provided
      const typeToUse = chatType || selectedChatType;

      // For direct messages, mark messages as read via API
      if (typeToUse === "contact") {
        await axios.post(
          `${backendUrl}/api/chat/messages/mark-as-read`,
          { senderId: chatId },
          {
            headers: {
              Authorization: `Bearer ${chatToken}`,
            },
          }
        );

        // Also emit socket event for real-time update
        if (socket.current) {
          socket.current.emit("markAsRead", {
            senderId: chatId,
            recipientId: chatUser.id,
          });
        }
      }
      // For channels, we just clear the local unread count
      // (channels don't have traditional read receipts)

      // Clear unread count for this chat/channel
      setUnreadCounts((prev) => ({
        ...prev,
        [chatId]: 0,
      }));

      console.log(
        "Marked chat as read and cleared unread count for:",
        chatId,
        "Type:",
        typeToUse
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const value = {
    chatUser,
    setChatUser,
    chatToken,
    setChatToken,
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
    isUploading,
    setIsUploading,
    isDownloading,
    setIsDownloading,
    fileUploadProgress,
    setFileUploadProgress,
    fileDownloadProgress,
    setFileDownloadProgress,
    unreadCounts,
    setUnreadCounts,
    onlineUsers,
    closeChat,
    markChatAsRead,
    socket,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
