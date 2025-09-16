import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ✅ Load user from localStorage if available
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check authentication from backend
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(data.user)); // ✅ keep in sync
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error("Session expired. Please login again.");
      logout();
    }
  };

  // Login
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        localStorage.setItem("authUser", JSON.stringify(data.userData)); // ✅ save
        connectSocket(data.userData);

        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser"); // ✅ clear stored user
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];

    toast.success("Logged out successfully");
    socket?.disconnect();
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        const updatedUser = data.user || data.updatedUser || data.userData; // fallback keys
        if (updatedUser) {
          setAuthUser(updatedUser);
          localStorage.setItem("authUser", JSON.stringify(updatedUser));
        }
        toast.success("Successfully updated profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendURL, { query: { userId: userData._id } });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
