import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotification();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Clear all notifications when dropdown closes
        clearAllNotifications();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [clearAllNotifications]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Delete the notification when clicked/viewed
    deleteNotification(notification.id);

    // If it's an outfit suggestion, redirect to chatbot with context
    if (
      notification.type === "outfit-suggestion" &&
      notification.outfitSuggestion
    ) {
      const chatContext = `I just received a styling suggestion for "${notification.productName}": ${notification.outfitSuggestion}`;

      // Store the context in sessionStorage for the chatbot to pick up
      sessionStorage.setItem(
        "stylistChatContext",
        JSON.stringify({
          productName: notification.productName,
          suggestion: notification.outfitSuggestion,
          timestamp: notification.timestamp,
          initialMessage: `I'd like to discuss the styling suggestion you gave me for "${notification.productName}". Can you give me more specific advice?`,
        })
      );

      // Close the dropdown and navigate to chatbot
      setIsOpen(false);
      navigate("/chatAI");
    }
  };

  const handleChatButtonClick = (e, notification) => {
    e.stopPropagation();

    // Delete the notification when chat button is clicked
    deleteNotification(notification.id);

    // Store the context for chatbot
    sessionStorage.setItem(
      "stylistChatContext",
      JSON.stringify({
        productName: notification.productName,
        suggestion: notification.outfitSuggestion,
        timestamp: notification.timestamp,
        initialMessage: `I'd like more styling tips for "${notification.productName}". Can you suggest different occasions, colors, or styling variations?`,
      })
    );

    // Close dropdown and navigate
    setIsOpen(false);
    navigate("/chatAI");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-700 hover:text-orange-500 transition-colors"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-pink-50">
            <h3 className="text-xl font-bold text-gray-800">
              Styling Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium px-3 py-1 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                <p className="text-lg font-medium">No styling tips yet</p>
                <p className="text-sm mt-2">
                  Add items to your wishlist to get personalized outfit
                  suggestions!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gradient-to-r hover:from-orange-25 hover:to-pink-25 transition-all duration-200 ${
                    !notification.read
                      ? "bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-l-orange-400"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4
                          className={`text-base font-semibold ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.outfitSuggestion && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 rounded-lg border-l-3 border-orange-300">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">✨</span>
                            <p className="text-sm font-semibold text-orange-700">
                              Personal Stylist Suggestion:
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {notification.outfitSuggestion}
                          </p>
                          <div className="mt-3 pt-3 border-t border-orange-200">
                            <button
                              onClick={(e) =>
                                handleChatButtonClick(e, notification)
                              }
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium bg-white px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                            >
                              💬 Chat for more styling tips →
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
