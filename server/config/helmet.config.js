const helmet = require("helmet");

const isDevelopment = process.env.NODE_ENV === "development";

const getSecurityPolicy = () => {
  return {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'", "https://js.stripe.com"],
    frameSrc: ["'self'", "https://js.stripe.com"],
    connectSrc: ["'self'", "https://api.stripe.com"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  };
};

const helmetConfig = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: getSecurityPolicy(),
    reportOnly: isDevelopment, // Enable report-only mode in development
    hsts: !isDevelopment
      ? {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
        }
      : false,
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  },
});

module.exports = helmetConfig;
