const express = require("express");
const { startConversation, getUserConversations, deleteConversation } = require("../controllers/conversationController");

const router = express.Router();

router.post("/", startConversation);
router.get("/:userId", getUserConversations);
router.delete("/:conversationId", deleteConversation);

module.exports = router;
