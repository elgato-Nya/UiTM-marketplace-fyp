const logger = require("../utils/logger");

const ensureRequestContext = (req, res, next) => {
  if (!req.correlationId) {
    req.correlationId = logger.generateCorrelationId();
  }

  if (!req.requestId) {
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  res.setHeader("X-Correlation-Id", req.correlationId);

  next();
};

module.exports = ensureRequestContext;
