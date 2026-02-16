import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

/**
 * Socket Context
 *
 * PURPOSE: Manage a single Socket.IO connection tied to auth state
 * LIFECYCLE:
 *   - Connect when user is authenticated (token available)
 *   - Reconnect automatically on transient failures
 *   - Disconnect on logout or unmount
 *
 * USAGE:
 *   const { socket, isConnected } = useSocket();
 *   socket.on('notification:new', handler);
 */

const SocketContext = createContext(null);

// Derive server root from the API URL (strip trailing /api)
const resolveServerUrl = () => {
  const apiUrl =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
};

const SERVER_URL = resolveServerUrl();

export const SocketProvider = ({ children }) => {
  const token = useSelector((state) => state.auth?.token);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Stable connect function
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 30000,
      timeout: 20000,
      withCredentials: true,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Connected:", socket.id);
      }
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (process.env.NODE_ENV === "development") {
        console.log("[Socket] Disconnected:", reason);
      }
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      if (process.env.NODE_ENV === "development") {
        console.warn("[Socket] Connection error:", err.message);
      }
    });

    socketRef.current = socket;
  }, [token]);

  // Stable disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  const value = {
    socket: socketRef.current,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to access the socket instance and connection status
 * @returns {{ socket: import('socket.io-client').Socket | null, isConnected: boolean }}
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context || { socket: null, isConnected: false };
};

export default SocketContext;
