describe("Configuration Modules Tests", () => {
  describe("Rate Limiter Configuration", () => {
    test("should export valid rate limiters", () => {
      const {
        generalLimiter,
        authLimiter,
      } = require("../../../config/limiter.config");

      expect(generalLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(typeof generalLimiter).toBe("function");
      expect(typeof authLimiter).toBe("function");
    });

    test("should not use deprecated onLimitReached option", () => {
      // Read the limiter config file to check for deprecated options
      const fs = require("fs");
      const path = require("path");
      const configPath = path.join(
        __dirname,
        "../../../config/limiter.config.js"
      );
      const configContent = fs.readFileSync(configPath, "utf8");

      expect(configContent).not.toContain("onLimitReached");
      expect(configContent).toContain("handler");
    });
  });

  describe("Logger Configuration", () => {
    test("should import winston-daily-rotate-file correctly", () => {
      expect(() => {
        require("../../../config/logger.config");
      }).not.toThrow();
    });

    test("should not use winston.transports.DailyRotateFile", () => {
      const fs = require("fs");
      const path = require("path");
      const configPath = path.join(
        __dirname,
        "../../../config/logger.config.js"
      );
      const configContent = fs.readFileSync(configPath, "utf8");

      expect(configContent).not.toContain("winston.transports.DailyRotateFile");
      expect(configContent).toContain("DailyRotateFile");
    });
  });

  describe("Database Configuration", () => {
    test("should not call dotenv.config() in module", () => {
      const fs = require("fs");
      const path = require("path");
      const configPath = path.join(
        __dirname,
        "../../../config/database.config.js"
      );
      const configContent = fs.readFileSync(configPath, "utf8");

      expect(configContent).not.toContain('require("dotenv").config()');
      expect(configContent).not.toContain("require('dotenv').config()");
    });
  });

  describe("Module Dependencies", () => {
    test("should not have circular dependencies", () => {
      expect(() => {
        require("../../../config/cors.config");
        require("../../../config/helmet.config");
        require("../../../config/limiter.config");
        require("../../../config/database.config");
        require("../../../utils/logger");
      }).not.toThrow();
    });

    test("should not call dotenv.config() in config modules", () => {
      const fs = require("fs");
      const path = require("path");
      const configDir = path.join(__dirname, "../../../config");
      const configFiles = fs
        .readdirSync(configDir)
        .filter((file) => file.endsWith(".js"));

      configFiles.forEach((file) => {
        const filePath = path.join(configDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        expect(content).not.toContain('require("dotenv").config()');
        expect(content).not.toContain("require('dotenv').config()");
      });
    });
  });
});
