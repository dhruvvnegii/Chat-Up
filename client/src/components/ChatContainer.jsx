import React, { useContext, useEffect, useRef, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Send text message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Send image message
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = ""; // Reset file input
    };
    reader.readAsDataURL(file);
  };

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="logo" />
        <p className="text-lg font-medium text-white">Chat Anytime, Anywhere</p>
      </div>
    );
  }

  const isUserOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Chat Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {isUserOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          src={assets.arrow_icon}
          className="md:hidden w-7 cursor-pointer"
          alt="back"
          onClick={() => setSelectedUser(null)}
        />
        <img src={assets.help_icon} className="hidden md:block w-5" alt="help" />
      </div>

      {/* Chat Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === authUser._id;
          return (
            <div
              key={index}
              className={`flex items-end mb-4 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {!isMe && (
                <img
                  src={assets.avatar_icon}
                  alt="avatar"
                  className="w-7 h-7 rounded-full mr-2"
                />
              )}
              <div className="max-w-[230px]">
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="message"
                    className="w-full border border-gray-700 rounded-lg"
                  />
                ) : (
                  <p
                    className={`p-2 md:text-sm font-light rounded-lg break-words text-white ${
                      isMe
                        ? "bg-violet-600 rounded-br-none text-right"
                        : "bg-violet-500/30 rounded-bl-none text-left"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                <p
                  className={`text-xs text-gray-500 mt-1 ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
              {isMe && (
                <img
                  src={authUser.profilePic}
                  alt="me"
                  className="w-7 h-7 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-grey-100/12 rounded-full px-3">
          <input
            type="text"
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            className="flex-1 p-3 text-sm text-white border-none rounded-lg outline-none placeholder-gray-400"
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            onChange={handleSendImage}
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt="attach"
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          src={assets.send_button}
          alt="send"
          className="w-7 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
