const express = require("express");

const {
  register,
  login,
  logout,
  refreshTokens,
  // forgotPassword, // TODO: implement forgot password
} = require("../../controllers/user");
const {
  validateRegister,
  validateLogin,
  // validateForgotPassword, // TODO: implement forgot password
} = require("../../middleware/validations");
const { protect } = require("../../middleware/auth/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshTokens);
// router.post("/forgot-password", forgotPassword);  // TODO: implement forgot password

// Protect all routes after this middleware
router.use(protect);
router.route("/logout").post(logout);

module.exports = router;
