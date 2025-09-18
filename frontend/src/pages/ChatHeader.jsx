import React, { useState } from "react";
import ProfileImage from "../components/ProfileImage.jsx";

const ChatHeader = ({ activeChat }) => {
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [modalImage, setModalImage] = useState(null);

  const getRandomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    const date = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return date.toDateString();
  };

  // 20 Indian member names
  const indianNames = [
    "Aarav",
    "Ananya",
    "Rohan",
    "Priya",
    "Vivaan",
    "Saanvi",
    "Arjun",
    "Isha",
    "Aditya",
    "Diya",
    "Karan",
    "Anika",
    "Shaurya",
    "Meera",
    "Devansh",
    "Tanya",
    "Vihaan",
    "Riya",
    "Kabir",
    "Aditi",
  ];

  const members = indianNames.map((name, i) => ({
    id: i,
    name,
    avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
    email: `${name.toLowerCase()}@example.com`,
  }));

  // 30 media items (mix of images and audio)
  const mediaItems = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    type: Math.random() < 0.4 ? "voice" : "image",
    src: `https://picsum.photos/200/200?random=${i + 1}`,
  }));

  // 10 random links
  const links = [
    { id: 1, title: "Google", url: "https://www.google.com" },
    { id: 2, title: "YouTube", url: "https://www.youtube.com" },
    { id: 3, title: "Wikipedia", url: "https://www.wikipedia.org" },
    { id: 4, title: "Reddit", url: "https://www.reddit.com" },
    { id: 5, title: "Stack Overflow", url: "https://stackoverflow.com" },
    { id: 6, title: "GitHub", url: "https://github.com" },
    { id: 7, title: "LinkedIn", url: "https://www.linkedin.com" },
    { id: 8, title: "Twitter", url: "https://twitter.com" },
    { id: 9, title: "Instagram", url: "https://www.instagram.com" },
    { id: 10, title: "Medium", url: "https://medium.com" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="flex flex-col items-center gap-4 bg-gray-50 p-4 rounded shadow-inner">
            <ProfileImage
              user={activeChat}
              size="w-24 h-24"
              showOnlineStatus={activeChat.type !== "channel"}
              className="shadow-lg"
            />
            <p className="font-bold text-2xl">{activeChat.name}</p>
            <p className="text-gray-600">Created on: {getRandomDate()}</p>
            <p className="text-gray-700 text-center px-4">
              Welcome to a place where ideas flourish and creativity meets
              collaboration. Share, connect, and enjoy the journey together.
            </p>
            <div className="flex gap-2 mt-2">
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-md">
                Exit Group
              </button>
              <button className="bg-blue-200 text-blue-800 px-4 py-2 rounded hover:bg-blue-300 shadow-md">
                Report Group
              </button>
            </div>
          </div>
        );
      case "Members":
        return (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto bg-gray-50 p-2 rounded">
            {members.map((member, idx) => (
              <div
                key={member.id}
                className={`flex justify-between items-center gap-3 p-3 rounded-lg shadow-md transition-shadow ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-100"
                } hover:shadow-xl`}
              >
                <div className="flex items-center gap-3">
                  <ProfileImage
                    user={{ ...member, _id: member.id }}
                    size="w-12 h-12"
                    showOnlineStatus={true}
                  />
                  <p className="text-gray-800 font-medium">{member.name}</p>
                </div>
                <p className="text-gray-500 text-sm">{member.email}</p>
              </div>
            ))}
          </div>
        );
      case "Media":
        return (
          <>
            <div className="grid grid-cols-5 gap-4">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="w-36 h-36 flex items-center justify-center bg-gray-200 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                  onClick={() =>
                    item.type === "image" && setModalImage(item.src)
                  }
                >
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      alt="media"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5v14l12-7-12-7z"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            {modalImage && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center bg-black/90"
                onClick={() => setModalImage(null)}
              >
                <img
                  src={modalImage}
                  alt="Full view"
                  className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
                />
              </div>
            )}
          </>
        );
      case "Links":
        return (
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto p-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-lg shadow-md hover:bg-gray-100 break-words"
              >
                {link.title} -{" "}
                <span className="text-blue-600 underline">{link.url}</span>
              </a>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white border-b flex items-center relative">
      <ProfileImage
        user={activeChat}
        size="w-10 h-10"
        showOnlineStatus={activeChat.type !== "channel"}
        onClick={() => setShowHeaderMenu(true)}
        className="mr-3 cursor-pointer"
      />
      <div onClick={() => setShowHeaderMenu(true)} className="cursor-pointer">
        <p className="font-medium">{activeChat.name}</p>
        {activeChat.type === "channel" && (
          <p className="text-sm text-gray-500 truncate">
            {activeChat.description || "No description"}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {activeChat.type === "dm" ? "Direct Message" : "Group Chat"}
        </p>
      </div>

      {showHeaderMenu && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-gray-100 w-[60vw] h-[60vh] rounded-lg shadow-2xl flex relative">
            <div className="w-36 bg-gray-300 p-4 flex flex-col gap-2 rounded-l-lg shadow-inner">
              {["Overview", "Members", "Media", "Links"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left p-2 rounded hover:bg-gray-400 ${
                    activeTab === tab
                      ? "bg-gray-400 font-semibold text-white"
                      : "text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>

            <button
              onClick={() => setShowHeaderMenu(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
