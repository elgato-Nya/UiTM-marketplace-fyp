/**
 * Integration Tests: Merchant Verification Service
 *
 * PURPOSE: Test UiTM email verification workflow
 * SCOPE: Token generation, email verification, business email management
 * DEPENDENCIES: Real MongoDB, User model, token service
 */

const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { merchantService } = require("../../../services/user");
const { setupTestDB } = require("../../utils/db");

describe("Merchant Verification Service Integration", () => {
  setupTestDB();

  let testUser;

  beforeEach(async () => {
    // Create a non-UiTM user for testing
    testUser = await User.create({
      email: "testuser@gmail.com",
      password: "Password123!",
      profile: {
        username: "testmerchant",
        firstName: "Test",
        lastName: "Merchant",
        phoneNumber: "01234567890",
        campus: "SHAH_ALAM",
        faculty: "COMPUTER_SCIENCE_MATH",
      },
      roles: ["consumer", "merchant"],
    });
  });

  describe("submitMerchantVerification", () => {
    it("should submit UiTM email and generate verification token", async () => {
      const verificationEmail = "test@student.uitm.edu.my";

      const result = await merchantService.submitMerchantVerification(
        testUser._id,
        verificationEmail
      );

      expect(result.status).toBe("verification_sent");
      expect(result.verificationEmail).toBe(verificationEmail);
      expect(result.expiresAt).toBeInstanceOf(Date);

      // Verify database was updated
      const updatedUser = await User.findById(testUser._id).select(
        "+merchantDetails.verificationEmail +merchantDetails.verificationToken +merchantDetails.verificationTokenExpires"
      );

      expect(updatedUser.merchantDetails.verificationEmail).toBe(
        verificationEmail
      );
      expect(updatedUser.merchantDetails.verificationToken).toBeDefined();
      expect(updatedUser.merchantDetails.verificationToken.length).toBe(60); // bcrypt hash
      expect(
        updatedUser.merchantDetails.verificationTokenExpires
      ).toBeInstanceOf(Date);
      expect(updatedUser.merchantDetails.isUiTMVerified).toBe(false);
    });

    it("should reject invalid UiTM email format", async () => {
      const invalidEmail = "test@gmail.com";

      await expect(
        merchantService.submitMerchantVerification(testUser._id, invalidEmail)
      ).rejects.toThrow(
        "Verification email must be a valid UiTM email address"
      );
    });

    it("should reject duplicate verification email", async () => {
      const verificationEmail = "test@student.uitm.edu.my";

      // Create another user with this verification email
      await User.create({
        email: "another@gmail.com",
        password: "Password123!",
        profile: {
          username: "anotheruser",
          firstName: "Another",
          lastName: "User",
          phoneNumber: "01234567892",
          campus: "SHAH_ALAM",
          faculty: "BUSINESS_MANAGEMENT",
        },
        roles: ["consumer", "merchant"],
        merchantDetails: {
          shopName: "Another Shop",
          verificationEmail,
          isUiTMVerified: true,
        },
      });

      await expect(
        merchantService.submitMerchantVerification(
          testUser._id,
          verificationEmail
        )
      ).rejects.toThrow(
        "This UiTM email is already used for merchant verification"
      );
    });

    it("should return already_verified for already verified merchants", async () => {
      // Update user to be verified
      testUser.merchantDetails = {
        shopName: "Test Verified Shop",
        verificationEmail: "verified@student.uitm.edu.my",
        isUiTMVerified: true,
        verificationDate: new Date(),
      };
      await testUser.save();

      const result = await merchantService.submitMerchantVerification(
        testUser._id,
        "newemail@student.uitm.edu.my"
      );

      expect(result.status).toBe("already_verified");
      expect(result.verificationEmail).toBe("verified@student.uitm.edu.my");
    });

    it("should handle different UiTM email domains", async () => {
      const domains = [
        "test@student.uitm.edu.my",
        "test@uitm.edu.my",
        "test@staff.uitm.edu.my",
      ];

      for (let i = 0; i < domains.length; i++) {
        const email = domains[i];
        const user = await User.create({
          email: `user${i}${Date.now()}@gmail.com`,
          password: "Password123!",
          profile: {
            username: `testuser${i}${Date.now().toString().slice(-6)}`,
            firstName: "Test",
            lastName: "User",
            phoneNumber: `0123456${(Date.now() + i).toString().slice(-4)}`,
            campus: "SHAH_ALAM",
            faculty: "COMPUTER_SCIENCE_MATH",
          },
          roles: ["consumer", "merchant"],
          merchantDetails: {
            shopName: `Test Shop ${i}${Date.now()}`,
          },
        });

        const result = await merchantService.submitMerchantVerification(
          user._id,
          email
        );

        expect(result.status).toBe("verification_sent");
        expect(result.verificationEmail).toBe(email);
      }
    });
  });

  describe("verifyMerchantEmail", () => {
    let verificationToken;

    beforeEach(async () => {
      // Submit verification first to get token
      const result = await merchantService.submitMerchantVerification(
        testUser._id,
        "test@student.uitm.edu.my"
      );
      verificationToken = result.token; // Service returns plain token
    });

    it("should reject invalid token", async () => {
      await expect(
        merchantService.verifyMerchantEmail(testUser._id, "invalid-token-12345")
      ).rejects.toThrow("Invalid or expired verification token");
    });

    it("should reject expired token", async () => {
      // Manually expire the token by updating directly
      await User.findByIdAndUpdate(testUser._id, {
        "merchantDetails.verificationTokenExpires": new Date(Date.now() - 1000),
      });

      await expect(
        merchantService.verifyMerchantEmail(testUser._id, verificationToken)
      ).rejects.toThrow("Invalid or expired verification token");
    });

    it("should reject verification for user without pending verification", async () => {
      // Create user without verification token
      const newUser = await User.create({
        email: "newuser@gmail.com",
        password: "Password123!",
        profile: {
          username: "newuser",
          firstName: "New",
          lastName: "User",
          phoneNumber: "01234567893",
          campus: "SHAH_ALAM",
          faculty: "COMPUTER_SCIENCE_MATH",
        },
        roles: ["consumer", "merchant"],
      });

      await expect(
        merchantService.verifyMerchantEmail(newUser._id, "any-token")
      ).rejects.toThrow("No pending verification found");
    });
  });

  describe("updateBusinessEmail", () => {
    beforeEach(async () => {
      // Ensure user has merchant role
      testUser.roles = ["consumer", "merchant"];
      await testUser.save();
    });

    it("should update business email with valid email", async () => {
      const businessEmail = "business@example.com";

      const result = await merchantService.updateBusinessEmail(
        testUser._id,
        businessEmail
      );

      expect(result.businessEmail).toBe(businessEmail);

      // Verify database was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.merchantDetails.businessEmail).toBe(businessEmail);
    });

    it("should clear business email when set to null", async () => {
      // First set an email
      testUser.merchantDetails = {
        shopName: "Test Shop Clear Email",
        businessEmail: "old@example.com",
      };
      await testUser.save();

      const result = await merchantService.updateBusinessEmail(
        testUser._id,
        null
      );

      expect(result.businessEmail).toBeNull();

      // Verify database was updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.merchantDetails.businessEmail).toBeNull();
    });

    it("should reject invalid email format", async () => {
      await expect(
        merchantService.updateBusinessEmail(testUser._id, "invalid-email")
      ).rejects.toThrow("Invalid email address format");
    });

    it("should accept any valid email domain", async () => {
      const emails = [
        "contact@gmail.com",
        "info@business.com",
        "support@shop.uitm.edu.my",
        "hello@example.co.uk",
      ];

      for (const email of emails) {
        const result = await merchantService.updateBusinessEmail(
          testUser._id,
          email
        );

        expect(result.businessEmail).toBe(email);
      }
    });

    it("should reject for non-merchant users", async () => {
      testUser.roles = ["consumer"]; // Remove merchant role
      await testUser.save();

      await expect(
        merchantService.updateBusinessEmail(
          testUser._id,
          "business@example.com"
        )
      ).rejects.toThrow("User is not a merchant");
    });
  });

  describe("Complete Verification Workflow", () => {});
});
