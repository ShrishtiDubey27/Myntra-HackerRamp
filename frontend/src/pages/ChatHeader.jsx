import React, { useState, useEffect } from "react";
import ProfileImage from "../components/ProfileImage.jsx";
import {
  getChannelDetails,
  leaveChannel,
  updateChannelDescription,
} from "../utils/chatAPI.js";
import { useChatContext } from "../context/ChatContext.jsx";
import { toast } from "react-toastify";

const ChatHeader = ({ activeChat }) => {
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [modalImage, setModalImage] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const { chatUser, setSelectedChatData, setSelectedChatType, setChannels } =
    useChatContext();

  // Fetch channel details when modal opens for a channel
  useEffect(() => {
    const fetchChannelData = async () => {
      if (showHeaderMenu && activeChat?.type === "channel") {
        setLoading(true);
        try {
          const response = await getChannelDetails(activeChat._id);
          console.log("Channel data received:", response); // Debug log
          setChannelData(response);
          setNewDescription(response.channel?.description || "");
        } catch (error) {
          console.error("Error fetching channel details:", error);
          toast.error("Failed to load channel details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchChannelData();
  }, [showHeaderMenu, activeChat]);

  const handleUpdateDescription = async () => {
    if (!activeChat?._id || activeChat.type !== "channel") return;

    try {
      const response = await updateChannelDescription(
        activeChat._id,
        newDescription
      );
      if (response.success) {
        toast.success("Group description updated successfully");
        setChannelData((prev) => ({
          ...prev,
          channel: {
            ...prev.channel,
            description: newDescription,
          },
        }));
        setEditingDescription(false);
      }
    } catch (error) {
      console.error("Error updating description:", error);
      toast.error(
        error.response?.data?.message || "Failed to update description"
      );
    }
  };

  const isUserAdmin = () => {
    const admin = channelData?.channel?.admin || channelData?.admin;
    return admin?._id === chatUser?.id;
  };

  const handleLeaveGroup = async () => {
    if (!activeChat?._id || activeChat.type !== "channel") return;

    const confirmLeave = window.confirm(
      "Are you sure you want to leave this group?"
    );
    if (!confirmLeave) return;

    try {
      const response = await leaveChannel(activeChat._id);
      if (response.success) {
        toast.success("Successfully left the group");

        // Update the channels list by removing this channel
        setChannels((prev) =>
          prev.filter((channel) => channel._id !== activeChat._id)
        );

        // Close the chat
        setSelectedChatData(undefined);
        setSelectedChatType(undefined);

        // Close the modal
        setShowHeaderMenu(false);
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error(error.response?.data?.message || "Failed to leave group");
    }
  };

  const extractLinksFromText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches || [];
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    switch (activeTab) {
      case "Overview":
        return (
          <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded shadow-inner">
            <ProfileImage
              user={activeChat}
              size="w-24 h-24"
              showOnlineStatus={activeChat.type !== "channel"}
              className="shadow-lg"
            />
            <p className="font-bold text-2xl">{activeChat.name}</p>
            <p className="text-gray-600">
              Created on:{" "}
              {channelData?.channel?.createdAt
                ? formatDate(channelData.channel.createdAt)
                : "Unknown"}
            </p>
            {activeChat.type === "channel" && (
              <p className="text-gray-700 text-center px-4">
                {channelData?.channel?.members?.length ||
                  channelData?.members?.length ||
                  0}{" "}
                members in this group
              </p>
            )}

            {/* Description Section for Channels */}
            {activeChat.type === "channel" && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Description</h4>
                  {isUserAdmin() && (
                    <button
                      onClick={() => setEditingDescription(!editingDescription)}
                      className="text-pink-500 hover:text-pink-600 text-sm"
                    >
                      {editingDescription ? "Cancel" : "Edit"}
                    </button>
                  )}
                </div>

                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Enter group description..."
                      className="w-full p-2 border rounded-md resize-none h-20"
                      maxLength={200}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateDescription}
                        className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
                      >
                        Save
                      </button>
                      <span className="text-xs text-gray-500 self-center">
                        {newDescription.length}/200
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 bg-white p-3 rounded-md">
                    {channelData?.channel?.description ||
                      "No description available"}
                  </p>
                )}
              </div>
            )}

            {activeChat.type === "channel" && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleLeaveGroup}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-md"
                >
                  Exit Group
                </button>
                <button className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300 shadow-md">
                  Report Group
                </button>
              </div>
            )}
          </div>
        );

      case "Members":
        const members =
          activeChat.type === "channel"
            ? channelData?.channel?.members || channelData?.members || []
            : [activeChat];
        return (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto bg-gray-50 p-2 rounded">
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No members found</p>
            ) : (
              members.map((member, idx) => (
                <div
                  key={member._id}
                  className={`flex justify-between items-center gap-3 p-3 rounded-lg shadow-md transition-shadow ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                  } hover:shadow-xl`}
                >
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      user={member}
                      size="w-12 h-12"
                      showOnlineStatus={true}
                    />
                    <div>
                      <p className="text-gray-800 font-medium">
                        {member.firstName && member.lastName
                          ? ${member.firstName} ${member.lastName}
                          : member.name || "Unknown"}
                        {member._id ===
                          (channelData?.channel?.admin?._id ||
                            channelData?.admin?._id) && (
                          <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-sm">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "Media":
        // Use media from response or filter messages to get only media (image, file, audio)
        const mediaMessages =
          channelData?.media ||
          (channelData?.messages || channelData?.channel?.messages)?.filter(
            (msg) =>
              msg.messageType &&
              ["image", "file", "audio"].includes(msg.messageType)
          ) ||
          [];

        return (
          <>
            <div className="grid grid-cols-5 gap-4">
              {mediaMessages.length === 0 ? (
                <div className="col-span-5 text-center py-8">
                  <p className="text-gray-500">No media shared yet</p>
                </div>
              ) : (
                mediaMessages.map((message) => (
                  <div
                    key={message._id}
                    className="w-36 h-36 flex items-center justify-center bg-gray-200 rounded-lg shadow-md hover:shadow-lg cursor-pointer relative group"
                    onClick={() => {
                      if (message.messageType === "image") {
                        setModalImage(message.fileUrl || message.content);
                      } else if (message.messageType === "file") {
                        window.open(
                          message.fileUrl || message.content,
                          "_blank"
                        );
                      } else if (message.messageType === "audio") {
                        const audio = new Audio(
                          message.fileUrl || message.content
                        );
                        audio.play();
                      }
                    }}
                  >
                    {message.messageType === "image" ? (
                      <img
                        src={message.fileUrl || message.content}
                        alt="media"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : message.messageType === "audio" ? (
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-600 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5v14l12-7-12-7z"
                          />
                        </svg>
                        <p className="text-xs text-gray-600 mt-1">Audio</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-600 mx-auto"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-xs text-gray-600 mt-1 px-1 truncate">
                          {message.fileName || "File"}
                        </p>
                      </div>
                    )}

                    {/* Hover overlay with date */}
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {modalImage && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center bg-black/90"
                onClick={() => setModalImage(null)}
              >
                <img
                  src={modalImage}
                  alt="Full view"
                  className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
                />
              </div>
            )}
          </>
        );

      case "Links":
        // Use links from response or filter messages to get only those with links
        const linkMessages =
          channelData?.links ||
          (channelData?.messages || channelData?.channel?.messages)?.filter(
            (msg) => msg.content && msg.content.match(/https?:\/\/[^\s]+/g)
          ) ||
          [];

        const allLinks = [];

        linkMessages.forEach((message) => {
          const links = extractLinksFromText(message.content);
          links.forEach((link) => {
            allLinks.push({
              id: ${message._id}-${link},
              url: link,
              sender: message.sender,
              timestamp: message.timestamp,
            });
          });
        });

        return (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto p-2">
            {allLinks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No links shared yet</p>
              </div>
            ) : (
              allLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3 bg-white rounded-lg shadow-md hover:bg-gray-100"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline break-words block"
                  >
                    {link.url}
                  </a>
                  <div className="text-xs text-gray-500 mt-1">
                    Shared by{" "}
                    {link.sender?.firstName || link.sender?.name || "Unknown"} •{" "}
                    {formatDate(link.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white border-b flex items-center relative">
      <ProfileImage
        user={activeChat}
        size="w-10 h-10"
        showOnlineStatus={activeChat.type !== "channel"}
        onClick={() => setShowHeaderMenu(true)}
        className="mr-3 cursor-pointer"
      />
      <div onClick={() => setShowHeaderMenu(true)} className="cursor-pointer">
        <p className="font-medium">{activeChat.name}</p>
        {activeChat.type === "channel" && (
          <p className="text-sm text-gray-500 truncate">
            {activeChat.description || "No description"}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {activeChat.type === "dm" ? "Direct Message" : "Group Chat"}
        </p>
      </div>

      {showHeaderMenu && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-gray-100 w-[60vw] h-[60vh] rounded-lg shadow-2xl flex relative">
            <div className="w-36 bg-gray-300 p-4 flex flex-col gap-2 rounded-l-lg shadow-inner">
              {["Overview", "Members", "Media", "Links"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left p-2 rounded hover:bg-gray-400 ${
                    activeTab === tab
                      ? "bg-gray-400 font-semibold text-white"
                      : "text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>

            <button
              onClick={() => setShowHeaderMenu(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;