import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { ChatContext } from "../context/ChatContext";
import {
  getAllContacts,
  searchContacts,
  getUserChannels,
} from "../utils/chatAPI";
import { assets } from "../assets/frontend_assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { toast } from "react-toastify";

const Wishlist = () => {
  const { wishlistItems, clearWishlist } = useContext(WishlistContext);
  // Safely handle ChatContext - it might not be initialized if user hasn't used chat features
  const chatContext = useContext(ChatContext);
  const { chatUser, directMessagesContacts, channels, socket } =
    chatContext || {};
  const location = useLocation();

  // Check if user came from Virtual Try-On feature
  const fromVirtualTryOn =
    new URLSearchParams(location.search).get("from") === "virtual-tryon";

  // Virtual Try-On states (moved from Collection.jsx)
  const [tryOnMode, setTryOnMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [activatedTryOn, setActivatedTryOn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Share to TrendTalk states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageData, setShareImageData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allUsersSearchResults, setAllUsersSearchResults] = useState([]);
  const [allChannelsResults, setAllChannelsResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Reset virtual try-on state on component mount
  useEffect(() => {
    sessionStorage.removeItem("activeModelId");
    setTryOnMode(false);
    setUploadedImage(null);
    setActivatedTryOn(false);

    return () => {
      sessionStorage.removeItem("activeModelId");
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Upload image
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name.split(".")[0].toLowerCase();

      setUploadedImage({
        url: URL.createObjectURL(file),
        modelId: fileName,
        isValidModel: fileName.match(/^model[1-5]$/),
      });
      setActivatedTryOn(false);
    }
  };

  const handleEnterTryOn = () => {
    if (!uploadedImage) return;

    const modelId = uploadedImage.modelId;
    const isValidModel = uploadedImage.isValidModel;

    setUploadedImage(null);
    setLoading(true);

    if (!isValidModel) {
      setTimeout(() => {
        setLoading(false);
        toast.error("Error Loading. Please try again later.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 2000);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setActivatedTryOn(true);
      sessionStorage.setItem("activeModelId", modelId);
      setTimeout(() => {
        window.dispatchEvent(new Event("storage"));
      }, 100);
    }, 2000);
  };

  const resetTryOnMode = () => {
    setTryOnMode(false);
    setUploadedImage(null);
    setActivatedTryOn(false);
    sessionStorage.removeItem("activeModelId");
    window.dispatchEvent(new Event("storage"));
  };

  // Share to TrendTalk functions
  const handleShareClick = (productId, productName) => {
    if (!chatUser) {
      toast.error("Please login to TrendTalk first!");
      return;
    }

    // Get the current try-on image for this product
    const activeModelId = sessionStorage.getItem("activeModelId");
    const product = wishlistItems.find((item) => item._id === productId);

    if (product && product.images && activeModelId) {
      const modelImage = product.images.find((img) => img.id === activeModelId);
      if (modelImage) {
        setShareImageData({
          imageUrl: modelImage.url,
          productName: productName,
          productId: productId,
        });
        setShareMessage(
          `🎭 Check out how ${productName} looks on me with virtual try-on!`
        );
        setShowShareModal(true);
        setSearchQuery("");
        setSelectedContact(null);
        setShowDropdown(false);
        setAllUsersSearchResults([]);
      }
    }
  };

  const handleContactSelect = (contact, isChannel = false) => {
    setSelectedContact({ ...contact, isChannel });
    setSearchQuery(
      contact.firstName
        ? `${contact.firstName} ${contact.lastName}`
        : contact.name
    );
    setShowDropdown(false);
  };

  // Search all users and channels function
  const handleUserSearch = async (query) => {
    if (!query.trim()) {
      setAllUsersSearchResults([]);
      setAllChannelsResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search for users
      const usersResponse = await searchContacts(query);
      setAllUsersSearchResults(usersResponse.contacts || []);

      // Get user's channels and filter by query
      const channelsResponse = await getUserChannels();
      const filteredChannels = (channelsResponse.channels || []).filter(
        (channel) => channel.name?.toLowerCase().includes(query.toLowerCase())
      );
      setAllChannelsResults(filteredChannels);
    } catch (error) {
      console.error("Search failed:", error);
      setAllUsersSearchResults([]);
      setAllChannelsResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleUserSearch(searchQuery);
      } else {
        setAllUsersSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSendShare = async () => {
    if (
      !shareImageData ||
      !chatUser ||
      isSharing ||
      !socket?.current ||
      !selectedContact
    ) {
      if (!selectedContact) {
        toast.error("Please select a contact or group first!");
      }
      return;
    }

    setIsSharing(true);

    try {
      const messageData = {
        sender: chatUser.id,
        content:
          shareMessage ||
          `🎭 Virtual Try-On Result: ${shareImageData.productName}\n\nThis is a virtual try-on picture showing how this product might look!`,
        messageType: "image",
        fileUrl: shareImageData.imageUrl,
        fileName: `virtual-tryon-${shareImageData.productName}.jpg`,
        fileSize: 0,
      };

      if (selectedContact.isChannel) {
        messageData.channelId = selectedContact._id;
        socket.current.emit("send-channel-message", messageData);
      } else {
        messageData.recipient = selectedContact._id;
        socket.current.emit("sendMessage", messageData);
      }

      toast.success(
        `Shared virtual try-on to ${
          selectedContact.firstName || selectedContact.name
        }!`
      );
      setShowShareModal(false);
      setSearchQuery("");
      setShareMessage("");
      setSelectedContact(null);
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  // Filter contacts and channels based on search - combine existing contacts with all users search
  const existingContacts = [
    ...(directMessagesContacts || []).map((contact) => ({
      ...contact,
      isChannel: false,
      isExisting: true,
    })),
    ...(channels || []).map((channel) => ({
      ...channel,
      isChannel: true,
      isExisting: true,
    })),
  ];

  const existingFilteredResults = searchQuery.trim()
    ? existingContacts.filter((item) => {
        if (item.isChannel) {
          return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          return (
            item.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      })
    : [];

  // Filter out existing contacts from search results to avoid duplicates
  const newUsersResults = allUsersSearchResults
    .filter((user) => {
      return !existingContacts.find(
        (existing) => !existing.isChannel && existing._id === user._id
      );
    })
    .map((user) => ({ ...user, isChannel: false, isExisting: false }));

  // Combine results: existing contacts first, then new users
  const allFilteredResults = [
    ...existingFilteredResults,
    ...newUsersResults,
  ].slice(0, 8); // Limit to 8 results total

  return (
    <div className="pt-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <Title text1={"MY"} text2={"WISHLIST"} />
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">{fromVirtualTryOn ? "👗" : "💔"}</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {fromVirtualTryOn
              ? "Virtual Try-On Awaits!"
              : "Your Wishlist is Empty"}
          </h2>
          <p className="text-gray-500 mb-6">
            {fromVirtualTryOn
              ? "To use Virtual Try-On, add some items to your wishlist first! Browse our collection and click the heart icon on products you'd like to try on."
              : "Add items to your wishlist by clicking the heart icon on products you love!"}
          </p>
          <a
            href="/collection"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300"
          >
            {fromVirtualTryOn
              ? "Browse & Add to Wishlist"
              : "Browse Collections"}
          </a>
        </div>
      ) : (
        <>
          {/* Virtual Try-On Toggle - Only shown when wishlist has items */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center w-full max-w-lg px-4">
              <div
                onClick={() => {
                  if (tryOnMode) {
                    resetTryOnMode();
                  } else {
                    setTryOnMode(true);
                  }
                }}
                className={`relative w-60 h-14 rounded-full cursor-pointer transition-colors duration-300 shadow-lg ${
                  tryOnMode ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-28 h-12 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    tryOnMode ? "translate-x-28" : ""
                  }`}
                >
                  <span className="font-semibold text-xs text-gray-700">
                    {tryOnMode ? "Virtual Try-On" : "See Wishlist"}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                  <span
                    className={`font-semibold text-xs transition-opacity duration-300 ${
                      !tryOnMode ? "opacity-0" : "opacity-70 text-white"
                    }`}
                  >
                    See Wishlist
                  </span>
                  <span
                    className={`font-semibold text-xs transition-opacity duration-300 ${
                      tryOnMode ? "opacity-0" : "opacity-70 text-gray-700"
                    }`}
                  >
                    Virtual Try-On
                  </span>
                </div>
              </div>

              {/* Upload section */}
              {tryOnMode && !activatedTryOn && !loading && (
                <div className="mt-6 flex flex-col items-center gap-4 w-full">
                  <label className="px-8 py-3 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition-all duration-300 text-center font-medium shadow-md min-w-52">
                    📸 Upload Your Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                    />
                  </label>

                  {uploadedImage && (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={uploadedImage.url}
                        alt="Uploaded"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-orange-500 shadow-md"
                      />
                      <button
                        onClick={handleEnterTryOn}
                        className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-center font-medium shadow-md min-w-52"
                      >
                        🚀 Enter Try-On Mode
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Loading spinner */}
              {loading && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">
                    Activating Virtual Try-On...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
            {wishlistItems.map((item, index) => (
              <div key={index} className="relative">
                <ProductItem
                  id={item._id}
                  image={item.image}
                  images={item.images}
                  name={item.name}
                  price={item.price}
                  enableVirtualTryOn={true}
                  className={
                    tryOnMode && activatedTryOn
                      ? "filter grayscale opacity-50"
                      : ""
                  }
                />

                {/* Share to TrendTalk Button - Only show when virtual try-on is active */}
                {tryOnMode && activatedTryOn && (
                  <button
                    onClick={() => handleShareClick(item._id, item.name)}
                    className="absolute bottom-2 right-2 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 opacity-90 hover:opacity-100"
                    title="Share to TrendTalk"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Share to TrendTalk Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share to TrendTalk</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSearchQuery("");
                  setShareMessage("");
                  setSelectedContact(null);
                  setShowDropdown(false);
                  setAllUsersSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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

            {/* Preview of what's being shared */}
            {shareImageData && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={shareImageData.imageUrl}
                    alt="Virtual Try-On"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">Virtual Try-On Result</p>
                    <p className="text-xs text-gray-600">
                      {shareImageData.productName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Search input with dropdown */}
            <div className="mb-4 relative dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contact or Group
              </label>
              <input
                type="text"
                placeholder="Search contacts and groups..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value.trim()) {
                    setSelectedContact(null);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Dropdown with search results */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10 mt-1">
                  {isSearching && (
                    <div className="flex items-center justify-center p-4">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">
                        Searching users...
                      </span>
                    </div>
                  )}

                  {!isSearching && allFilteredResults.length > 0 ? (
                    <>
                      {/* Show existing contacts and groups first */}
                      {existingFilteredResults.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                            Your Contacts & Groups
                          </div>
                          {existingFilteredResults.map((item) => (
                            <button
                              key={`existing-${item._id}`}
                              onClick={() =>
                                handleContactSelect(item, item.isChannel)
                              }
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left border-b border-gray-50 last:border-b-0"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                                  item.isChannel
                                    ? "bg-blue-500"
                                    : "bg-orange-500"
                                }`}
                              >
                                {item.isChannel ? (
                                  "#"
                                ) : item.image ? (
                                  <img
                                    src={item.image}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  item.firstName?.charAt(0) ||
                                  item.email?.charAt(0) ||
                                  "?"
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {item.isChannel
                                    ? item.name
                                    : `${item.firstName} ${item.lastName}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.isChannel
                                    ? `${item.members?.length || 0} members`
                                    : item.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Show new users from search */}
                      {newUsersResults.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                            All Users
                          </div>
                          {newUsersResults.map((user) => (
                            <button
                              key={`new-${user._id}`}
                              onClick={() => handleContactSelect(user, false)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left border-b border-gray-50 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user.image ? (
                                  <img
                                    src={user.image}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  user.firstName?.charAt(0) ||
                                  user.email?.charAt(0) ||
                                  "?"
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.name || user.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                New
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Show all channels from search */}
                      {allChannelsResults.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                            Your Groups/Channels
                          </div>
                          {allChannelsResults.map((channel) => (
                            <button
                              key={`channel-${channel._id}`}
                              onClick={() => handleContactSelect(channel, true)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left border-b border-gray-50 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                #
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {channel.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {channel.members?.length || 0} members •{" "}
                                  {channel.admin?.firstName || "Unknown"} admin
                                </p>
                              </div>
                              <div className="text-xs text-purple-600 font-medium">
                                Group
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  ) : !isSearching && searchQuery.trim() ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No users found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a message (optional)
              </label>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Write something about your virtual try-on..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {/* Selected contact display */}
            {selectedContact && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-700">Sending to:</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                      selectedContact.isChannel
                        ? "bg-blue-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {selectedContact.isChannel
                      ? "#"
                      : selectedContact.firstName?.charAt(0) || "?"}
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {selectedContact.isChannel
                      ? selectedContact.name
                      : `${selectedContact.firstName} ${selectedContact.lastName}`}
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSearchQuery("");
                  setShareMessage("");
                  setSelectedContact(null);
                  setShowDropdown(false);
                  setAllUsersSearchResults([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendShare}
                disabled={!selectedContact || isSharing}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSharing ? "Sending..." : "Send"}
              </button>
            </div>

            {/* Loading state */}
            {isSharing && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Sharing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
