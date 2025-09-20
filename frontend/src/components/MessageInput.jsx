import React, { useState, useRef, useContext } from "react";
import EmojiPicker from "emoji-picker-react";
import { ChatContext } from "../context/ChatContext.jsx";
import { ShopContext } from "../context/ShopContext.jsx";
import VoiceRecorder from "./VoiceRecorder.jsx";
import CreatePollModal from "./CreatePollModal.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const MessageInput = ({ selectedChatData, selectedChatType }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { socket, chatToken, chatUser } = useContext(ChatContext);
  const { backendUrl } = useContext(ShopContext);

  const handleSendMessage = () => {
    if (!message.trim() && !selectedChatData) return;
    if (!socket.current || !chatUser) return;

    if (selectedChatType === "contact") {
      socket.current.emit("sendMessage", {
        sender: chatUser.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
      });
    } else if (selectedChatType === "channel") {
      socket.current.emit("send-channel-message", {
        sender: chatUser.id,
        content: message,
        channelId: selectedChatData._id,
        messageType: "text",
      });
    }

    setMessage("");
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !chatToken) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${backendUrl}/api/chat/messages/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${chatToken}`,
          },
        }
      );

      if (response.data.filePath) {
        const messageType = file.type.startsWith("image/") ? "image" : "file";

        if (selectedChatType === "contact") {
          socket.current.emit("sendMessage", {
            sender: chatUser.id,
            content: file.name,
            recipient: selectedChatData._id,
            messageType: messageType,
            fileUrl: response.data.filePath,
            fileName: file.name,
            fileSize: file.size,
          });
        } else if (selectedChatType === "channel") {
          socket.current.emit("send-channel-message", {
            sender: chatUser.id,
            content: file.name,
            channelId: selectedChatData._id,
            messageType: messageType,
            fileUrl: response.data.filePath,
            fileName: file.name,
            fileSize: file.size,
          });
        }

        toast.success("File uploaded successfully!");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob, duration) => {
    if (!audioBlob || !chatToken) return;

    setIsUploading(true);
    try {
      const audioFile = new File([audioBlob], "voice-message.webm", {
        type: audioBlob.type,
      });

      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await axios.post(
        `${backendUrl}/api/chat/messages/upload-file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${chatToken}`,
          },
        }
      );

      if (response.data.filePath) {
        const messageData = {
          sender: chatUser.id,
          content: "Voice Message",
          messageType: "audio",
          audioUrl: response.data.filePath,
          duration: Math.round(duration),
          timestamp: new Date(),
        };

        if (selectedChatType === "contact") {
          socket.current.emit("sendMessage", {
            ...messageData,
            recipient: selectedChatData._id,
          });
        } else if (selectedChatType === "channel") {
          socket.current.emit("send-channel-message", {
            ...messageData,
            channelId: selectedChatData._id,
          });
        }

        toast.success("Voice message sent!");
        setShowVoiceRecorder(false);
      }
    } catch (error) {
      console.error("Voice message upload error:", error);
      toast.error("Failed to send voice message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceRecorderCancel = () => {
    setShowVoiceRecorder(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePollCreated = (pollResponse) => {
    if (!socket.current || !chatUser) return;

    // Send poll as a message through socket
    const pollMessage = {
      sender: chatUser.id,
      messageType: "poll",
      pollId: pollResponse.poll._id,
      pollData: pollResponse.poll,
      timestamp: new Date(),
    };

    if (selectedChatType === "contact") {
      socket.current.emit("sendMessage", {
        ...pollMessage,
        recipient: selectedChatData._id,
      });
    } else if (selectedChatType === "channel") {
      socket.current.emit("send-channel-message", {
        ...pollMessage,
        channelId: selectedChatData._id,
      });
    }

    toast.success("Poll created successfully!");
  };

  const getChatData = () => {
    return {
      chatType: selectedChatType === "contact" ? "direct" : "channel",
      chatId: selectedChatData?._id,
      recipient: selectedChatType === "contact" ? selectedChatData?._id : null,
    };
  };

  return (
    <div className="relative">
      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Record Voice Message
            </h3>
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecordingComplete}
              onCancel={handleVoiceRecorderCancel}
            />
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-0 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Message Input Container */}
      <div className="h-[10vh] bg-gray-50 flex justify-center items-center px-8 mb-6 gap-6">
        <div className="flex-1 flex bg-white rounded-md items-center gap-5 pr-5">
          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-2 hover:text-yellow-500"
          >
            😊
          </button>

          {/* Text Input */}
          <input
            type="text"
            className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isUploading}
          />

          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-2 hover:text-blue-500"
            disabled={isUploading}
          >
            📎
          </button>

          {/* Voice Recording Button */}
          <button
            onClick={() => setShowVoiceRecorder(true)}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-2 hover:text-green-500"
            disabled={isUploading}
            title="Record Voice Message"
          >
            🎤
          </button>

          {/* Create Poll Button */}
          <button
            onClick={() => setShowCreatePoll(true)}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-2 hover:text-purple-500"
            disabled={isUploading}
            title="Create Fashion Poll"
          >
            📊
          </button>

          {/* Send Button */}
          <button
            className="bg-blue-500 rounded-md flex items-center justify-center p-3 hover:bg-blue-600 focus:bg-blue-700 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={handleSendMessage}
            disabled={isUploading}
          >
            <span className="text-white font-medium">Send</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/,audio/,video/*,.pdf,.doc,.docx,.txt"
      />

      {/* Upload Progress Indicator */}
      {isUploading && (
        <div className="absolute top-0 left-0 right-0 bg-blue-500 h-1">
          <div className="h-full bg-blue-700 animate-pulse"></div>
        </div>
      )}

      {/* Create Poll Modal */}
      <CreatePollModal
        isOpen={showCreatePoll}
        onClose={() => setShowCreatePoll(false)}
        onPollCreated={handlePollCreated}
        backendUrl={backendUrl}
        userToken={chatToken}
        chatData={getChatData()}
      />
    </div>
  );
};

export default MessageInput;
