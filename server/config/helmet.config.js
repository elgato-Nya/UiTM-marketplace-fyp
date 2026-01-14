/**
 * Helmet Security Configuration
 *
 * Comprehensive security headers configuration addressing OWASP recommendations:
 * - Content Security Policy (CSP)
 * - HTTP Strict Transport Security (HSTS)
 * - X-Frame-Options (clickjacking protection)
 * - X-Content-Type-Options (MIME sniffing protection)
 * - Referrer Policy
 * - Cross-Origin policies
 *
 * @see https://helmetjs.github.io/
 * @see docs/security-fix.md for OWASP ZAP findings
 */
const helmet = require("helmet");

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Content Security Policy directives
 * Restricts which resources can be loaded to prevent XSS attacks
 */
const getSecurityPolicy = () => {
  const directives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://js.stripe.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: [
      "'self'",
      "https://api.stripe.com",
      // Add localhost for development API calls
      ...(isDevelopment ? ["http://localhost:5000"] : []),
    ],
    frameSrc: ["'self'", "https://js.stripe.com"],
    frameAncestors: ["'self'"], // Prevents clickjacking - replaces X-Frame-Options
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    // Only upgrade insecure requests in production
    ...(isProduction && { upgradeInsecureRequests: [] }),
  };

  return directives;
};

const helmetConfig = helmet({
  // Disable cross-origin embedder policy for Stripe compatibility
  crossOriginEmbedderPolicy: false,

  // Content Security Policy - primary XSS protection
  contentSecurityPolicy: {
    directives: getSecurityPolicy(),
    // Report-only in development to avoid breaking things during testing
    reportOnly: isDevelopment,
  },

  // HTTP Strict Transport Security - forces HTTPS
  hsts: isProduction
    ? {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true, // Allow inclusion in browser preload lists
      }
    : false, // Disable in development (localhost uses HTTP)

  // X-Frame-Options - clickjacking protection (backup for CSP frame-ancestors)
  frameguard: { action: "sameorigin" },

  // X-Content-Type-Options - prevents MIME sniffing
  noSniff: true,

  // Referrer-Policy - controls referrer information
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // X-DNS-Prefetch-Control - controls DNS prefetching
  dnsPrefetchControl: { allow: false },

  // X-Download-Options - prevents IE from executing downloads
  ieNoOpen: true,

  // X-Permitted-Cross-Domain-Policies - restricts Adobe Flash/PDF
  permittedCrossDomainPolicies: { permittedPolicies: "none" },

  // Cross-Origin-Opener-Policy - isolates browsing context
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // Cross-Origin-Resource-Policy - controls resource sharing
  crossOriginResourcePolicy: { policy: "same-origin" },

  // Origin-Agent-Cluster - hints browser to use separate agent cluster
  originAgentCluster: true,
});

module.exports = helmetConfig;
