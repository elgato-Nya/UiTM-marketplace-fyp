module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Project-specific scopes based on your MERN marketplace structure
    "scope-enum": [
      2,
      "always",
      [
        // Backend - Core Features
        "auth", // Authentication & authorization
        "user", // User profile management
        "merchant", // Merchant/shop management
        "listing", // Product/service listings
        "cart", // Shopping cart
        "checkout", // Checkout process
        "order", // Order management
        "wishlist", // Wishlist functionality
        "analytics", // Analytics & reporting
        "upload", // File/image uploads
        "contact", // Contact & support
        "chat", // Real-time chat/messaging

        // Backend - Infrastructure
        "api", // API endpoints/routes
        "service", // Business logic services
        "controller", // Request handlers
        "model", // Database models/schemas
        "middleware", // Express middleware
        "validator", // Input validation
        "config", // Configuration files
        "utils", // Utility functions

        // Frontend
        "ui", // UI components
        "page", // Page components
        "store", // Redux store/slices
        "hook", // Custom React hooks
        "theme", // Theming/styling
        "layout", // Layout components

        // DevOps & Tools
        "ci", // CI/CD pipelines
        "deploy", // Deployment configs
        "docker", // Docker configs
        "aws", // AWS services

        // Development
        "test", // Testing (unit/integration)
        "docs", // Documentation
        "script", // Build/utility scripts
        "deps", // Dependencies
        "cleanup", // Code cleanup
        "security", // Security improvements

        // General
        "root", // Root-level changes
        "server", // Server-side (general)
        "client", // Client-side (general)
      ],
    ],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Formatting, missing semicolons, etc
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Performance improvements
        "test", // Adding missing tests or correcting existing tests
        "chore", // Changes to build process or auxiliary tools
        "revert", // Reverts a previous commit
        "ci", // CI/CD related changes
      ],
    ],
    // Additional rules for better commit quality
    "header-max-length": [2, "always", 100],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
  },
};
