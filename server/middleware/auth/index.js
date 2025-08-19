const { protect, authorize } = require("./auth.middleware");

module.exports = {
  protect,
  authorize,
  authenticateUser: protect, // Alias for backward compatibility
};