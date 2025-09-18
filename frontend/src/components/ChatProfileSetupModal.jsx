import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ChatProfileSetupModal = ({ isOpen, onClose, userToken, backendUrl }) => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    profileImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error("Please fill in your first and last name");
      return;
    }

    setIsLoading(true);
    try {
      // Sync user to chat database with profile setup
      const response = await axios.post(
        `${backendUrl}/api/chat/sync-user`,
        {
          token: userToken,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          image: profileData.profileImage,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Chat profile setup complete!");
        onClose();
        navigate("/chat");
      } else {
        toast.error(response.data.message || "Failed to setup chat profile");
      }
    } catch (error) {
      console.error("Chat profile setup error:", error);
      toast.error("Failed to setup chat profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Setup Chat Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4 text-sm">
          Please complete your profile to start using TrendTalks chat feature.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={profileData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={profileData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <input
              type="url"
              name="profileImage"
              placeholder="Profile Image URL (optional)"
              value={profileData.profileImage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {profileData.profileImage && (
            <div className="flex justify-center">
              <img
                src={profileData.profileImage}
                alt="Profile Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 transition disabled:opacity-50"
            >
              {isLoading ? "Setting up..." : "Continue to Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatProfileSetupModal;
