const express = require("express");
const { getUserProfile, updateUserProfile, searchUsers, updateUserStatus } = require("../controllers/userController");

const router = express.Router();

router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateUserProfile);
router.get("/search", searchUsers);
router.put("/status/:id", updateUserStatus);

module.exports = router;
