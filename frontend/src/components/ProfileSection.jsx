import React from "react";
import { useChatContext } from "../context/ChatContext.jsx";
import ProfileImage from "./ProfileImage.jsx";

const ProfileSection = () => {
  const { chatUser } = useChatContext();

  if (!chatUser) return null;

  const getDisplayName = () => {
    if (chatUser.firstName && chatUser.lastName) {
      return ${chatUser.firstName} ${chatUser.lastName};
    }
    if (chatUser.name) {
      return chatUser.name;
    }
    return chatUser.email;
  };

  return (
    <div className="border-t border-gray-600 p-3">
      <div className="flex items-center gap-3 p-2 rounded-lg">
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
      </div>
    </div>
  );
};

export default ProfileSection;