import { createContext, useEffect } from "react";
import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(AuthContext);

  //functions to add all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  //function to get message of selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error("Error fetching messages");
    }
  };

  //function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error sending message");
    }
  };

  //function to subscribe to new messages
  const subscribeToMessages = () => {
    if (!socket) {
      return;
    }
    
    socket.on("newMessage", (newMessage) => {
      // Only add messages from OTHER users, not your own messages
      if (newMessage.senderId !== authUser?._id) {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
          newMessage.seen = true;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          axios.put(`/api/messages/mark/${newMessage._id}`);
        } else {
          setUnseenMessages((prevUnseen) => ({
            ...prevUnseen,
            [newMessage.senderId]: prevUnseen[newMessage.senderId]
              ? prevUnseen[newMessage.senderId] + 1
              : 1,
          }));
        }
      }
    });
  };

  //Function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  useEffect(() => {
    if (socket && authUser) {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [socket, selectedUser, authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    setMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};