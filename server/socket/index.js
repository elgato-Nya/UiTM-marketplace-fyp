const { Server } = require("socket.io");
const socketConfig = require("../config/socket.config");
const logger = require("../utils/logger");
const { verifyAccessToken } = require("../services/jwt.service");
const { User } = require("../models/user");
const { registerChatHandlers } = require("./handlers/chat.handler");

/**
 * Socket.IO Manager
 *
 * PURPOSE: Central hub for WebSocket lifecycle management
 * RESPONSIBILITIES:
 *   - Initialize Socket.IO server on the HTTP instance
 *   - Authenticate connections via JWT handshake middleware
 *   - Join authenticated users to their private room (userId)
 *   - Expose getIO() for emitting events from anywhere in the app
 *   - Track connected user count for monitoring
 *
 * USAGE:
 *   const { initializeSocket, getIO } = require('./socket');
 *   initializeSocket(httpServer);  // call once at startup
 *   getIO().to(userId).emit('notification:new', payload);  // emit from services
 */

let io = null;

/**
 * Authenticate socket connection using JWT from handshake
 * Extracts token from auth header or query param
 */
const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warn("Socket connection rejected: no token provided", {
        socketId: socket.id,
        address: socket.handshake.address,
      });
      return next(new Error("Authentication required"));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      logger.warn("Socket connection rejected: invalid token", {
        socketId: socket.id,
      });
      return next(new Error("Invalid authentication token"));
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select(
      "_id email roles profile.username"
    );
    if (!user) {
      logger.warn("Socket connection rejected: user not found", {
        socketId: socket.id,
        userId: decoded.userId,
      });
      return next(new Error("User account not found"));
    }

    // Attach user data to socket for downstream handlers
    socket.userId = user._id.toString();
    socket.userRoles = user.roles || [];
    socket.userName = user.profile?.username || user.email;

    next();
  } catch (err) {
    logger.error("Socket authentication error", {
      socketId: socket.id,
      error: err.message,
    });
    return next(new Error("Authentication failed"));
  }
};

/**
 * Initialize Socket.IO on the given HTTP server
 * @param {http.Server} httpServer - Node HTTP server instance
 * @returns {Server} The Socket.IO server
 */
const initializeSocket = (httpServer) => {
  if (io) {
    logger.warn("Socket.IO already initialized, returning existing instance");
    return io;
  }

  io = new Server(httpServer, socketConfig);

  // Global auth middleware — every connection must pass JWT check
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const { userId, userName } = socket;

    // Join user to their personal room for targeted emits
    socket.join(userId);

    logger.info("Socket connected", {
      socketId: socket.id,
      userId,
      userName,
      connectedClients: io.engine.clientsCount,
    });

    // Acknowledge successful connection to the client
    socket.emit("connected", {
      message: "Real-time connection established",
      userId,
    });

    // Register feature-specific socket event handlers
    registerChatHandlers(socket);

    // Handle voluntary disconnect
    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", {
        socketId: socket.id,
        userId,
        reason,
        connectedClients: io.engine.clientsCount - 1,
      });
    });

    // Generic error handler per-socket
    socket.on("error", (err) => {
      logger.error("Socket error", {
        socketId: socket.id,
        userId,
        error: err.message,
      });
    });
  });

  logger.info("✅ Socket.IO initialized successfully");
  return io;
};

/**
 * Get the active Socket.IO server instance
 * @returns {Server|null} The Socket.IO server or null if not yet initialized
 */
const getIO = () => {
  if (!io) {
    logger.warn("Socket.IO not initialized — getIO() called too early");
  }
  return io;
};

/**
 * Emit an event to a specific user by their userId
 * Safe wrapper that no-ops if Socket.IO isn't ready
 *
 * @param {string} userId - Target user's MongoDB _id
 * @param {string} event  - Event name (e.g. 'notification:new')
 * @param {*} payload      - Data payload to send
 */
const emitToUser = (userId, event, payload) => {
  if (!io) {
    logger.debug("Socket.IO not initialized, skipping emit", { event, userId });
    return;
  }
  io.to(userId.toString()).emit(event, payload);
};

/**
 * Gracefully close all socket connections
 * Called during server shutdown
 */
const closeSocket = () => {
  if (io) {
    io.close();
    io = null;
    logger.info("Socket.IO server closed");
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  closeSocket,
};
