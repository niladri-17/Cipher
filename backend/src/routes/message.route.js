const express = require("express");
const { sendMessage, getMessages, deleteMessage, markMessageAsSeen } = require("../controllers/messageController");

const router = express.Router();

router.post("/", sendMessage);
router.get("/:conversationId", getMessages);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId/seen", markMessageAsSeen);

module.exports = router;
