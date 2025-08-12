const path = require("path");
const fs = require("fs");

describe("Environment Configuration Validation", () => {
  let envPath;
  let envContent;

  beforeAll(() => {
    envPath = path.join(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }
  });

  describe(".env file validation", () => {
    test("should have .env file present", () => {
      expect(fs.existsSync(envPath)).toBe(true);
    });

    test("should not contain JavaScript expressions in values", () => {
      if (envContent) {
        // Check for common JavaScript expressions that shouldn't be in .env
        const invalidPatterns = [
          /=.*\*.*/, // multiplication
          /=.*\+.*/, // addition (but allow in URLs)
          /=.*\/\/.*\/.*/, // division (but allow in URLs)
          /=.*Math\./, // Math object
          /=.*parseInt/, // parseInt function
          /=.*parseFloat/, // parseFloat function
        ];

        const lines = envContent
          .split("\n")
          .filter(
            (line) =>
              line.trim() &&
              !line.trim().startsWith("#") &&
              !line.includes("://")
          );

        lines.forEach((line) => {
          invalidPatterns.forEach((pattern) => {
            if (pattern.test(line) && !line.includes("://")) {
              throw new Error(`Invalid expression in .env line: ${line}`);
            }
          });
        });
      }
    });

    test("should have all required environment variables defined", () => {
      const requiredVars = [
        "NODE_ENV",
        "PORT",
        "MONGO_URI",
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET",
      ];

      if (envContent) {
        requiredVars.forEach((varName) => {
          const regex = new RegExp(`^${varName}=.+`, "m");
          expect(envContent).toMatch(regex);
        });
      }
    });

    test("should not have duplicate environment variable definitions", () => {
      if (envContent) {
        const varNames = [];
        const lines = envContent.split("\n");

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const varName = trimmed.split("=")[0];
            expect(varNames).not.toContain(varName);
            varNames.push(varName);
          }
        });
      }
    });
  });

  describe("dotenv loading", () => {
    test("should load environment variables without errors", () => {
      expect(() => {
        require("dotenv").config({ path: envPath });
      }).not.toThrow();
    });

    test("should not have undefined values after loading", () => {
      // Save original env
      const originalEnv = { ...process.env };

      // Clear test env vars
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.MONGO_URI;

      // Load from .env
      require("dotenv").config({ path: envPath });

      // Check that values are not undefined
      expect(process.env.NODE_ENV).not.toBe("undefined");
      expect(process.env.PORT).not.toBe("undefined");
      expect(process.env.MONGO_URI).not.toBe("undefined");

      // Restore original env
      Object.assign(process.env, originalEnv);
    });
  });
});
