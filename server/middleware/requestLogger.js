const logger = require("../utils/logger");

/**
 * Enhanced Request Logging Middleware
 *
 * Provides:
 * - Request correlation IDs
 * - Performance monitoring
 * - Enhanced request/response logging
 * - Error correlation
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Generate and attach correlation ID
  const correlationId = logger.generateCorrelationId();
  req.correlationId = correlationId;

  // Create child logger for this request
  req.logger = logger.createChild({
    correlationId,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || "unknown",
  });

  // Log incoming request
  req.logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    headers: {
      "content-type": req.headers?.["content-type"],
      "content-length": req.headers?.["content-length"],
      authorization: req.headers?.["authorization"] ? "present" : "none",
    },
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    body:
      req.method !== "GET" && req.body
        ? typeof req.body === "object"
          ? Object.keys(req.body)
          : "present"
        : undefined,
  });

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function (data) {
    const responseTime = Date.now() - startTime;

    // Log response
    req.logger.info("Outgoing response", {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength:
        res.get("Content-Length") || (data ? JSON.stringify(data).length : 0),
      success: res.statusCode < 400,
      errorCode: data?.code || undefined,
      hasData: !!data?.data,
    });

    // Log to main logger for analytics
    logger.request(req, res, responseTime);

    return originalJson.call(this, data);
  };

  // Override res.status to capture status changes
  const originalStatus = res.status;
  res.status = function (code) {
    // Log status changes for debugging
    if (code >= 400) {
      req.logger.warn("Error status set", {
        statusCode: code,
        route: req.originalUrl,
        method: req.method,
      });
    }
    return originalStatus.call(this, code);
  };

  // Handle response finish event
  res.on("finish", () => {
    const responseTime = Date.now() - startTime;

    // Log completion
    req.logger.debug("Request completed", {
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      completed: true,
    });
  });

  next();
};

module.exports = requestLogger;
