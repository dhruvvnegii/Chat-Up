import React, { useEffect } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
const RightSidebar = () => {
  const { selectedUser, messages } = React.useContext(ChatContext);
  const { logout, onlineUsers } = React.useContext(AuthContext);
  const [msgImg, setMsgImg] = React.useState([]);

  //get all images
  useEffect(() => {
    setMsgImg(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 aspect-[1/1] rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <p className="w-2 h-2 rounded-full bg-green-500 "></p>
            )}
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>
        <hr className="border-gray-700 my-4" />
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {/* Map through user's media files and display them */}
            {msgImg.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)}
                className="cursor-pointer rounded"
              >
                <img src={url} className="h-full rounded-md" alt="" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r  from-purple-400 to-violet-600 border-none text-white text-sm px-20 py-2 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default RightSidebar;
