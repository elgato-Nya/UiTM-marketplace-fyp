module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Project-specific scopes based on your folder structure
    "scope-enum": [
      2,
      "always",
      [
        "auth", // Authentication system
        "user", // User management
        "product", // Product features
        "api", // API endpoints
        "ui", // User interface changes
        "middleware", // Express middleware
        "config", // Configuration
        "utils", // Utilities
        "test", // Testing
        "docs", // Documentation
        "service", // Service layer
        "utils", // Utility functions
        "cleanup", // Code cleanup
      ],
    ],
    "subject-max-length": [2, "always", 72],
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "refactor", // Code refactoring
        "test", // Testing
        "chore", // Maintenance
        "perf", // Performance improvements
      ],
    ],
  },
};
