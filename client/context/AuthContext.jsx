import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null); // user object comes from backend
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Fetch user profile from backend
  const fetchUserProfile = async (userId) => {
    try {
      const { data } = await axios.get(`/api/auth/user/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
    }
  };

  // Check authentication
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        logout();
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
        const { token, userData } = data;

        // save minimal info
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userData._id);

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setToken(token);
        setAuthUser(userData);
        connectSocket(userData);

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
    localStorage.removeItem("userId");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    socket?.disconnect();
    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success && data.user) {
        setAuthUser(data.user);
        toast.success("Successfully updated profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendURL, {
      query: { userId: userData._id },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => console.log("Socket connected successfully"));
    newSocket.on("disconnect", () => console.log("Socket disconnected"));
    newSocket.on("connect_error", (error) =>
      console.error("Socket connection error:", error)
    );

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  };

  // On app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      setToken(storedToken);

      if (storedUserId) {
        fetchUserProfile(storedUserId);
      } else {
        checkAuth(); // fallback check
      }
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
