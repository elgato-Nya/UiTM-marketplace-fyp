const corsService = require("../services/cors.service");

/**
 * Socket.IO Configuration
 *
 * PURPOSE: Centralized Socket.IO server options
 * MIRRORS: CORS settings from cors.config.js for consistency
 * FEATURES: Reconnection tuning, transport config, auth timeout
 */

const socketConfig = {
  cors: {
    origin: (origin, callback) => corsService.validateOrigin(origin, callback),
    credentials: true,
    methods: ["GET", "POST"],
  },
  // Start with polling then upgrade to WebSocket for reliability behind proxies
  transports: ["polling", "websocket"],
  // Ping/pong heartbeat settings
  pingInterval: 25000,
  pingTimeout: 20000,
  // Connection timeout for initial handshake
  connectTimeout: 15000,
  // Allow binary data
  allowEIO3: false,
  // Max buffer size (1MB)
  maxHttpBufferSize: 1e6,
};

module.exports = socketConfig;
