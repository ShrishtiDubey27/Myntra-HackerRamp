import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import axios from "axios";
import { ShopContext } from "../context/ShopContext.jsx";

const UnreadIndicator = ({
  contactId,
  children,
  onMarkAsRead,
  isSelected = false,
  chatType = "contact", // Add chatType prop with default
}) => {
  const { unreadCounts, markChatAsRead } = useContext(ChatContext);
  const [localCount, setLocalCount] = useState(0);

  // Get count from global unread counts
  const globalCount = unreadCounts[contactId] || 0;

  useEffect(() => {
    setLocalCount(globalCount);
  }, [globalCount]);

  // Clear count when chat is selected
  useEffect(() => {
    if (isSelected && localCount > 0) {
      markChatAsRead(contactId, chatType);
      setLocalCount(0);
    }
  }, [isSelected, contactId, markChatAsRead, localCount, chatType]);

  const handleContactClick = () => {
    // When contact is clicked, mark messages as read
    if (localCount > 0) {
      markChatAsRead(contactId, chatType);
      setLocalCount(0);
      if (onMarkAsRead) {
        onMarkAsRead(contactId);
      }
    }
  };

  return (
    <div className="relative w-full" onClick={handleContactClick}>
      {children}
      {/* Show counter only if there are unread messages AND this chat is not currently selected */}
      {localCount > 0 && !isSelected && (
        <div className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 z-10">
          {localCount > 99 ? "99+" : localCount}
        </div>
      )}
    </div>
  );
};

export default UnreadIndicator;
