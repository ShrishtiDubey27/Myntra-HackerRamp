import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";

const ProfileImage = ({
  user,
  size = "w-8 h-8",
  showOnlineStatus = true,
  className = "",
  onClick,
}) => {
  const { onlineUsers } = useContext(ChatContext);

  const isOnline = onlineUsers.has(user._id || user.id);

  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.name) {
      return user.name;
    }
    return user.email || "Unknown";
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];

  const colorClass = avatarColors[user.color] || avatarColors[0];
  const displayName = getDisplayName(user);
  const initials = getInitials(displayName);

  if (user.image) {
    return (
      <div className={`relative ${className}`} onClick={onClick}>
        <img
          src={user.image}
          alt={displayName}
          className={`${size} rounded-full object-cover cursor-pointer`}
        />
        {showOnlineStatus && isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <div
        className={`${size} rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ${colorClass}`}
      >
        {initials}
      </div>
      {showOnlineStatus && isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
};

export default ProfileImage;
