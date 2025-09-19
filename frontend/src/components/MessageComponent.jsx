import React, { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import { ShopContext } from "../context/ShopContext.jsx";
import VoiceMessage from "./VoiceMessage.jsx";

const MessageComponent = ({ message, isChannel = false }) => {
  const { chatUser } = useContext(ChatContext);
  const { backendUrl } = useContext(ShopContext);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fix the ID comparison - chatUser has 'id' field, message.sender has '_id'
  const isOwnMessage =
    message.sender._id === chatUser?.id || message.sender === chatUser?.id;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFileUrl = (filePath) => {
    // Check if it's already a full URL (external or blob URL)
    if (
      filePath?.startsWith("http") ||
      filePath?.startsWith("blob:") ||
      filePath?.startsWith("data:")
    ) {
      return filePath;
    }
    return ${backendUrl}/${filePath};
  };

  const handleAudioPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = getFileUrl(message.fileUrl);
    link.download = message.fileName || "download";
    link.click();
  };

  const getMessageStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.messageStatus) {
      case "sent":
        return <span className="text-gray-400">✓</span>;
      case "delivered":
        return <span className="text-gray-500">✓✓</span>;
      case "seen":
        return <span className="text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
      case "emoji":
        return <div className="break-words">{message.content}</div>;

      case "image":
        return (
          <div className="space-y-2">
            <img
              src={getFileUrl(message.fileUrl)}
              alt={message.fileName}
              className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => window.open(getFileUrl(message.fileUrl), "_blank")}
            />
            {message.content && message.content !== message.fileName && (
              <div className="text-sm">{message.content}</div>
            )}
          </div>
        );

      case "file":
        return (
          <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📄</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {message.fileName || message.content}
                </div>
                <div className="text-xs text-gray-500">
                  {message.fileSize
                    ? ${(message.fileSize / 1024).toFixed(1)} KB
                    : "File"}
                </div>
              </div>
              <button
                onClick={downloadFile}
                className="flex-shrink-0 text-blue-500 hover:text-blue-700"
              >
                ⬇
              </button>
            </div>
          </div>
        );

      case "audio":
        // Use the new VoiceMessage component for audio messages
        return (
          <VoiceMessage
            audioUrl={getFileUrl(message.audioUrl || message.fileUrl)}
            duration={message.duration}
            isOwnMessage={isOwnMessage}
            timestamp={message.timestamp}
          />
        );

      default:
        return (
          <div className="text-gray-500 italic">Unsupported message type</div>
        );
    }
  };

  return (
    <div
      className={flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4}
    >
      {/* Special handling for voice messages */}
      {message.messageType === "audio" ? (
        <div className="relative">
          {/* Channel message sender name for voice messages */}
          {isChannel && !isOwnMessage && (
            <div className="text-xs font-semibold mb-1 text-gray-600 ml-2">
              {message.sender.firstName ||
                message.sender.name ||
                message.sender.email}
            </div>
          )}
          {renderMessageContent()}
        </div>
      ) : (
        /* Regular message container */
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {/* Channel message sender name */}
          {isChannel && !isOwnMessage && (
            <div className="text-xs font-semibold mb-1 opacity-75">
              {message.sender.firstName ||
                message.sender.name ||
                message.sender.email}
            </div>
          )}

          {/* Message content */}
          <div className="mb-1">{renderMessageContent()}</div>

          {/* Message time and status */}
          <div
            className={`flex items-center justify-end space-x-1 text-xs ${
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span>{formatTime(message.timestamp)}</span>
            {getMessageStatusIcon()}
          </div>

          {/* Message tail */}
          <div
            className={`absolute top-2 ${
              isOwnMessage
                ? "right-0 transform translate-x-1 border-l-8 border-l-blue-500 border-t-8 border-t-transparent border-b-8 border-b-transparent"
                : "left-0 transform -translate-x-1 border-r-8 border-r-gray-200 border-t-8 border-t-transparent border-b-8 border-b-transparent"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default MessageComponent;