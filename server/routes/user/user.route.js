const express = require("express");

const { getMe, updateMe } = require("../../controllers/user");
const {
  validateUpdateMe,
} = require("../../middleware/validations/user.validation");
const { protect } = require("../../middleware/auth/auth.middleware");

const router = express.Router();

router.use(protect);
router.route("/me").get(getMe).patch(validateUpdateMe, updateMe);

module.exports = router;
