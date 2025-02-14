const express = require("express");
const { getNotifications, markNotificationAsRead, deleteNotification } = require("../controllers/notificationController");

const router = express.Router();

router.get("/:userId", getNotifications);
router.put("/:notificationId/read", markNotificationAsRead);
router.delete("/:notificationId", deleteNotification);

module.exports = router;
