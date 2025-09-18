import React, { useState } from "react";
import { searchContacts } from "../../src/utils/chatAPI.js";

const AddDMModal = ({ isOpen, onClose, onAddContact }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchContacts(searchTerm);
      setSearchResults(response.contacts || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = (contact) => {
    onAddContact(contact);
    onClose();
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setSearchResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Direct Message</h2>
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
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={handleSearch}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="max-h-48 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          )}

          {!isLoading && searchResults.length === 0 && searchTerm && (
            <p className="text-gray-500 text-center py-4">No users found</p>
          )}

          {!isLoading &&
            searchResults.map((contact) => (
              <div
                key={contact._id}
                onClick={() => handleAddContact(contact)}
                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mr-3">
                  {contact.image ? (
                    <img
                      src={contact.image}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {(
                        contact.firstName?.[0] ||
                        contact.name?.[0] ||
                        contact.email?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {contact.firstName && contact.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : contact.name || contact.email}
                  </p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AddDMModal;
