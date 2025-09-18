import React, { useState, useEffect } from "react";
import { getAllContacts, createChannel } from "../../src/utils/chatAPI.js";

const CreateChannelModal = ({ isOpen, onClose, onChannelCreated }) => {
  const [channelName, setChannelName] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await getAllContacts();
      setAllContacts(response.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberToggle = (contactId) => {
    setSelectedMembers((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      alert("Please enter a channel name");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    setIsCreating(true);
    try {
      const response = await createChannel(channelName, selectedMembers);
      onChannelCreated(response.channel);
      handleClose();
    } catch (error) {
      console.error("Failed to create channel:", error);
      alert("Failed to create channel");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setChannelName("");
    setSelectedMembers([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Channel</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Channel name..."
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">
            Select Members ({selectedMembers.length} selected)
          </h3>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : (
              allContacts.map((contact) => (
                <div
                  key={contact.value}
                  onClick={() => handleMemberToggle(contact.value)}
                  className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedMembers.includes(contact.value)
                      ? "bg-orange-100"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.value)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs mr-2">
                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.label}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="font-bold">
                        {(contact.label?.[0] || "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{contact.label}</p>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateChannel}
            disabled={
              isCreating || !channelName.trim() || selectedMembers.length === 0
            }
            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
