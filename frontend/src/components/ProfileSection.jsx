import React, { useState } from "react";
import { useChatContext } from "../context/ChatContext.jsx";
import ProfileImage from "./ProfileImage.jsx";

const ProfileSection = () => {
  const { chatUser } = useChatContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!chatUser) return null;

  const getDisplayName = () => {
    if (chatUser.firstName && chatUser.lastName) {
      return `${chatUser.firstName} ${chatUser.lastName}`;
    }
    if (chatUser.name) {
      return chatUser.name;
    }
    return chatUser.email;
  };

  return (
    <div className="border-t border-gray-600 p-3">
      <div
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
        onClick={() => setShowProfileMenu(!showProfileMenu)}
      >
        <ProfileImage
          user={chatUser}
          size="w-10 h-10"
          showOnlineStatus={true}
        />

        <div className="flex-1 overflow-hidden">
          <p className="text-white font-medium text-sm truncate">
            {getDisplayName()}
          </p>
          <p className="text-gray-400 text-xs truncate">{chatUser.email}</p>
        </div>

        <div className="text-gray-400">
          <svg
            className={`w-4 h-4 transition-transform ${
              showProfileMenu ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {showProfileMenu && (
        <div className="mt-2 bg-gray-700 rounded-lg py-2">
          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            onClick={() => {
              // TODO: Open profile settings modal
              console.log("Edit profile");
            }}
          >
            ✏️ Edit Profile
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            onClick={() => {
              // TODO: Handle status change
              console.log("Change status");
            }}
          >
            🟢 Online
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-gray-600 hover:text-red-200"
            onClick={() => {
              // TODO: Handle logout
              console.log("Logout");
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
