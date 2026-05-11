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
  const isHealthCheck = req.path === "/api/health";

  // Reuse the lightweight request context created before rate limiting.
  const correlationId = req.correlationId || logger.generateCorrelationId();
  const requestId =
    req.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  req.correlationId = correlationId;
  req.requestId = requestId;
  res.setHeader("X-Correlation-Id", correlationId);

  // Create child logger for this request
  req.logger = logger.createChild({
    correlationId,
    requestId,
    route: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers?.["user-agent"] || "unknown",
  });

  // Log incoming request
  const incomingLogMethod = isHealthCheck ? "debug" : "info";
  req.logger[incomingLogMethod]("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    headers: {
      "content-type": req.headers?.["content-type"],
      "content-length": req.headers?.["content-length"],
      authorization: req.headers?.["authorization"] ? "present" : "none",
    },
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function (data) {
    res.locals._loggerResponseMeta = {
      errorCode: data?.code || undefined,
      hasData: !!data?.data,
      contentLength:
        res.get("Content-Length") || (data ? JSON.stringify(data).length : 0),
    };

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
    const responseMeta = res.locals._loggerResponseMeta || {};

    const outgoingLogMethod = isHealthCheck ? "debug" : "info";
    req.logger[outgoingLogMethod]("Outgoing response", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: responseTime,
      contentLength: res.get("Content-Length") || responseMeta.contentLength,
      success: res.statusCode < 400,
      errorCode: responseMeta.errorCode,
      hasData: responseMeta.hasData,
      ip: req.ip,
      userAgent: req.headers?.["user-agent"] || "unknown",
      userId: req.user?.id || req.user?._id || "undefined",
      correlationId,
      requestId,
    });

    // Log completion
    req.logger.debug("Request completed", {
      statusCode: res.statusCode,
      durationMs: responseTime,
      completed: true,
    });

    // Log to main logger for analytics
    if (!isHealthCheck) {
      logger.request(req, res, responseTime);
    }
  });

  next();
};

module.exports = requestLogger;
