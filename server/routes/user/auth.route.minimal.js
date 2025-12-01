const express = require("express");
const router = express.Router();

// Minimal test routes to check if basic routing works
router.get("/test", (req, res) => {
  res.json({ message: "Auth route test working" });
});

router.post("/test-post", (req, res) => {
  res.json({ message: "Auth POST test working" });
});

module.exports = router;
