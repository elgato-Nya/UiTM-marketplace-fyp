const {
  sanitizeInput,
  sanitizeObject,
  sanitizeArray,
  sanitizeQuery,
  sanitizeBody,
  containsMongoOperator,
} = require("../../../utils/sanitizer");

describe("Sanitizer Utils - NoSQL Injection Prevention", () => {
  describe("containsMongoOperator()", () => {
    it("should detect keys starting with $", () => {
      expect(containsMongoOperator("$gt")).toBe(true);
      expect(containsMongoOperator("$ne")).toBe(true);
      expect(containsMongoOperator("$where")).toBe(true);
      expect(containsMongoOperator("$regex")).toBe(true);
    });

    it("should detect keys with nested operators", () => {
      expect(containsMongoOperator("price.$gt")).toBe(true);
      expect(containsMongoOperator("user.age.$gte")).toBe(true);
    });

    it("should allow normal keys", () => {
      expect(containsMongoOperator("email")).toBe(false);
      expect(containsMongoOperator("price")).toBe(false);
      expect(containsMongoOperator("user_id")).toBe(false);
      expect(containsMongoOperator("$regularFieldName")).toBe(true); // Still dangerous
    });

    it("should handle non-string inputs", () => {
      expect(containsMongoOperator(null)).toBe(false);
      expect(containsMongoOperator(undefined)).toBe(false);
      expect(containsMongoOperator(123)).toBe(false);
    });
  });

  describe("sanitizeInput()", () => {
    it("should remove HTML tags", () => {
      expect(sanitizeInput("<script>alert('xss')</script>")).toBe("");
      expect(sanitizeInput("<b>bold</b>")).toBe("bold");
      expect(sanitizeInput("Hello <div>World</div>")).toBe("Hello World");
    });

    it("should normalize whitespace", () => {
      expect(sanitizeInput("Hello    World")).toBe("Hello World");
      expect(sanitizeInput("  Multiple   Spaces  ")).toBe("Multiple Spaces");
    });

    it("should handle non-string inputs", () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe("sanitizeObject() - NoSQL Injection Prevention", () => {
    it("should remove MongoDB operators from object keys", () => {
      const malicious = {
        email: "test@example.com",
        password: { $ne: null }, // NoSQL injection attempt
      };

      const sanitized = sanitizeObject(malicious);

      expect(sanitized).toEqual({
        email: "test@example.com",
        // password field with $ne should be completely removed
      });
      expect(sanitized.password).toBeUndefined();
    });

    it("should remove nested MongoDB operators", () => {
      const malicious = {
        user: {
          email: "test@example.com",
          age: { $gt: 0 }, // Injection attempt
        },
      };

      const sanitized = sanitizeObject(malicious);

      expect(sanitized).toEqual({
        user: {
          email: "test@example.com",
          // age field with $gt removed
        },
      });
      expect(sanitized.user.age).toBeUndefined();
    });

    it("should handle $where operator injection", () => {
      const malicious = {
        $where: "this.password === 'admin'",
        email: "test@example.com",
      };

      const sanitized = sanitizeObject(malicious);

      expect(sanitized).toEqual({
        email: "test@example.com",
      });
      expect(sanitized.$where).toBeUndefined();
    });

    it("should sanitize arrays with operators", () => {
      const malicious = {
        emails: ["valid@example.com", { $ne: null }],
      };

      const sanitized = sanitizeObject(malicious);

      expect(sanitized.emails).toHaveLength(2);
      expect(sanitized.emails[0]).toBe("valid@example.com");
      expect(sanitized.emails[1]).toEqual({}); // Operator removed
    });

    it("should preserve valid nested objects", () => {
      const valid = {
        user: {
          profile: {
            name: "John Doe",
            age: 30,
          },
          settings: {
            theme: "dark",
          },
        },
      };

      const sanitized = sanitizeObject(valid);

      expect(sanitized).toEqual(valid);
    });

    it("should handle ObjectId and Date objects", () => {
      const { ObjectId } = require("mongoose").Types;
      const testId = new ObjectId();
      const testDate = new Date();

      const obj = {
        _id: testId,
        createdAt: testDate,
        name: "Test",
      };

      const sanitized = sanitizeObject(obj);

      expect(sanitized._id).toBe(testId);
      expect(sanitized.createdAt).toBe(testDate);
      expect(sanitized.name).toBe("Test");
    });

    it("should sanitize strings and remove operators together", () => {
      const malicious = {
        username: "<script>alert('xss')</script>",
        password: { $ne: null },
        email: "test@example.com",
      };

      const sanitized = sanitizeObject(malicious);

      expect(sanitized).toEqual({
        username: "",
        email: "test@example.com",
      });
    });

    it("should respect options.removeOperators flag", () => {
      const obj = {
        email: "test@example.com",
        password: { $ne: null },
      };

      // With operator removal (default)
      const sanitizedWithRemoval = sanitizeObject(obj, {
        removeOperators: true,
      });
      expect(sanitizedWithRemoval.password).toBeUndefined();

      // Without operator removal
      const sanitizedWithoutRemoval = sanitizeObject(obj, {
        removeOperators: false,
      });
      expect(sanitizedWithoutRemoval.password).toEqual({ $ne: null });
    });

    it("should respect options.sanitizeStrings flag", () => {
      const obj = {
        username: "<b>Bold</b>",
      };

      // With string sanitization (default)
      const sanitizedWithStrings = sanitizeObject(obj, {
        sanitizeStrings: true,
      });
      expect(sanitizedWithStrings.username).toBe("Bold");

      // Without string sanitization
      const sanitizedWithoutStrings = sanitizeObject(obj, {
        sanitizeStrings: false,
      });
      expect(sanitizedWithoutStrings.username).toBe("<b>Bold</b>");
    });
  });

  describe("sanitizeQuery()", () => {
    it("should sanitize query parameters with operators", () => {
      const query = {
        email: "test@example.com",
        age: { $gt: 18 },
      };

      const sanitized = sanitizeQuery(query);

      expect(sanitized).toEqual({
        email: "test@example.com",
      });
    });

    it("should handle common NoSQL injection patterns", () => {
      const queries = [
        { username: { $ne: null } },
        { password: { $regex: ".*" } },
        { $where: "this.username === 'admin'" },
      ];

      queries.forEach((query) => {
        const sanitized = sanitizeQuery(query);
        expect(Object.keys(sanitized).some((key) => key.startsWith("$"))).toBe(
          false
        );
      });
    });
  });

  describe("sanitizeBody()", () => {
    it("should sanitize request body", () => {
      const body = {
        email: "test@example.com",
        password: "SecurePass123!",
        $where: "malicious code",
      };

      const sanitized = sanitizeBody(body);

      expect(sanitized).toEqual({
        email: "test@example.com",
        password: "SecurePass123!",
      });
      expect(sanitized.$where).toBeUndefined();
    });
  });

  describe("sanitizeArray()", () => {
    it("should sanitize array of strings", () => {
      const arr = [
        "Normal String",
        "<script>XSS</script>",
        "  Multiple   Spaces  ",
      ];

      const sanitized = sanitizeArray(arr);

      expect(sanitized).toEqual(["Normal String", "", "Multiple Spaces"]);
    });

    it("should sanitize array of objects with operators", () => {
      const arr = [
        { name: "John", age: 30 },
        { name: "Jane", age: { $gt: 18 } },
      ];

      const sanitized = sanitizeArray(arr);

      expect(sanitized[0]).toEqual({ name: "John", age: 30 });
      expect(sanitized[1]).toEqual({ name: "Jane" });
      expect(sanitized[1].age).toBeUndefined();
    });

    it("should handle nested arrays", () => {
      const arr = [
        ["item1", "<b>item2</b>"],
        [{ $ne: null }, "valid"],
      ];

      const sanitized = sanitizeArray(arr);

      expect(sanitized[0]).toEqual(["item1", "item2"]);
      expect(sanitized[1][0]).toEqual({});
      expect(sanitized[1][1]).toBe("valid");
    });
  });

  describe("Real-world attack scenarios", () => {
    it("should prevent login bypass attack", () => {
      // Attacker tries: { email: "admin@example.com", password: { $ne: null } }
      const loginAttempt = {
        email: "admin@example.com",
        password: { $ne: null },
      };

      const sanitized = sanitizeObject(loginAttempt);

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.email).toBe("admin@example.com");
    });

    it("should prevent data extraction via $regex", () => {
      const searchQuery = {
        username: { $regex: "^admin" },
        email: "test@example.com",
      };

      const sanitized = sanitizeQuery(searchQuery);

      expect(sanitized.username).toBeUndefined();
      expect(sanitized.email).toBe("test@example.com");
    });

    it("should prevent $where code injection", () => {
      const maliciousQuery = {
        $where: "function() { return true; }",
        status: "active",
      };

      const sanitized = sanitizeQuery(maliciousQuery);

      expect(sanitized.$where).toBeUndefined();
      expect(sanitized.status).toBe("active");
    });

    it("should handle combined XSS and NoSQL injection", () => {
      const payload = {
        username: "<script>alert('xss')</script>",
        password: { $ne: null },
        email: { $regex: ".*@admin\\.com" },
        bio: "Normal bio text",
      };

      const sanitized = sanitizeObject(payload);

      expect(sanitized).toEqual({
        username: "",
        bio: "Normal bio text",
      });
    });
  });
});
