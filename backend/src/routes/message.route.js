import express from "express";
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  markMessageAsSeen,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, sendMessage);
router.get("/:chatId", verifyJWT, getMessages);
router.patch("/:messageId", verifyJWT, updateMessage);
router.delete("/:messageId", verifyJWT, deleteMessage);
router.put("/:messageId/seen", verifyJWT, markMessageAsSeen);

export default router;
