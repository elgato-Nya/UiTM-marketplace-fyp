const express = require("express");

const { getMe, updateMe } = require("../../controllers/user");
const {
  validateUpdateMe,
} = require("../../middleware/validations/user.validation");
const { protect } = require("../../middleware/auth/auth.middleware");

const router = express.Router();

router.use(protect);

// Use separate route declarations instead of chaining for better compatibility
router.get("/me", getMe);
router.put("/me", validateUpdateMe, updateMe); // Using PUT instead of PATCH for Express 5 compatibility

module.exports = router;
