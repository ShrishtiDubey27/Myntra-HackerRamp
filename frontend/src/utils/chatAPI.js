import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || `http://localhost:${process.env.VITE_BACKEND_PORT}`;

const chatAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/chat`,
  withCredentials: true,
});

// Search contacts
export const searchContacts = async (searchTerm) => {
  const response = await chatAPI.post("/contacts/search", { searchTerm });
  return response.data;
};

// Get all contacts
export const getAllContacts = async () => {
  const response = await chatAPI.get("/contacts/get-all-contacts");
  return response.data;
};

// Get contacts for DM list
export const getContactsForDMList = async () => {
  const response = await chatAPI.get("/contacts/get-contacts-for-dm");
  return response.data;
};

// Get messages
export const getMessages = async (id) => {
  const response = await chatAPI.post("/messages/get-messages", { id });
  return response.data;
};

// Upload file
export const uploadFile = async (formData) => {
  const response = await chatAPI.post("/messages/upload-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Create channel
export const createChannel = async (name, members) => {
  const response = await chatAPI.post("/channel/create-channel", {
    name,
    members,
  });
  return response.data;
};

// Get user channels
export const getUserChannels = async () => {
  const response = await chatAPI.get("/channel/get-user-channels");
  return response.data;
};

// Get all channels
export const getAllChannels = async () => {
  const response = await chatAPI.get("/channel/get-all-channels");
  return response.data;
};

// Get channel messages
export const getChannelMessages = async (channelId) => {
  const response = await chatAPI.get(
    `/channel/get-channel-messages/${channelId}`
  );
  return response.data;
};

// Get channel details (members, media, links)
export const getChannelDetails = async (channelId) => {
  const response = await chatAPI.get(
    `/channel/get-channel-details/${channelId}`
  );
  return response.data;
};

// Leave channel
export const leaveChannel = async (channelId) => {
  const response = await chatAPI.post(`/channel/leave-channel/${channelId}`);
  return response.data;
};

// Update channel description
export const updateChannelDescription = async (channelId, description) => {
  const response = await chatAPI.put(
    `/channel/update-description/${channelId}`,
    {
      description,
    }
  );
  return response.data;
};

// Update profile
export const updateProfile = async (firstName, lastName, color) => {
  const response = await chatAPI.post("/auth/update-profile", {
    firstName,
    lastName,
    color,
  });
  return response.data;
};

// Add profile image
export const addProfileImage = async (formData) => {
  const response = await chatAPI.post("/auth/add-profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Remove profile image
export const removeProfileImage = async () => {
  const response = await chatAPI.delete("/auth/remove-profile-image");
  return response.data;
};

// Get user info
export const getUserInfo = async () => {
  const response = await chatAPI.get("/auth/userinfo");
  return response.data;
};

export default chatAPI;
