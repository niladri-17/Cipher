const express = require("express");
const { createGroup, addGroupMember, removeGroupMember, sendGroupMessage, getGroupMessages } = require("../controllers/groupController");

const router = express.Router();

router.post("/create", createGroup);
router.put("/:groupId/add", addGroupMember);
router.put("/:groupId/remove", removeGroupMember);
router.post("/:groupId/message", sendGroupMessage);
router.get("/:groupId/messages", getGroupMessages);

module.exports = router;
