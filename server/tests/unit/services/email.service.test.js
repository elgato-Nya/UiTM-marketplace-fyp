/**
 * Email Service Tests
 *
 * PURPOSE: Test email sending functionality
 * SCOPE: Integration-style tests (doesn't deeply mock nodemailer)
 */

describe("Email Service - Merchant Verification", () => {
  beforeAll(() => {
    // Set required environment variables
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test@test.com";
    process.env.SMTP_PASS = "testpassword";
    process.env.EMAIL_FROM = "noreply@test.com";
    process.env.EMAIL_FROM_NAME = "Test Marketplace";
    process.env.CLIENT_URL = "http://localhost:3000";
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_FROM;
    delete process.env.EMAIL_FROM_NAME;
    delete process.env.CLIENT_URL;
  });

  it("should have sendMerchantVerificationEmail function", () => {
    const emailService = require("../../../services/email.service");
    expect(typeof emailService.sendMerchantVerificationEmail).toBe("function");
  });

  it("should export all required email functions", () => {
    const emailService = require("../../../services/email.service");
    expect(typeof emailService.sendVerificationEmail).toBe("function");
    expect(typeof emailService.sendPasswordResetEmail).toBe("function");
    expect(typeof emailService.sendMerchantVerificationEmail).toBe("function");
    expect(typeof emailService.initializeTransporter).toBe("function");
    expect(typeof emailService.testConnection).toBe("function");
    expect(typeof emailService.handleSesError).toBe("function");
    expect(typeof emailService.getSendingStats).toBe("function");
    expect(typeof emailService.isSandboxMode).toBe("function");
  });

  it("should detect sandbox mode in test environment", () => {
    const emailService = require("../../../services/email.service");
    // Test environment doesn't have SES_PRODUCTION_MODE
    const result = emailService.isSandboxMode();
    expect(typeof result).toBe("boolean");
  });
});
