import express from "express";
import {
  getAllChats,
  searchAllChats,
  startPrivateChat,
  activatePrivateChat,
  startGroupChat,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/all", verifyJWT, getAllChats);
router.get("/all/search", verifyJWT, searchAllChats);
router.post("/private", verifyJWT, startPrivateChat);
router.patch("/:chatId/activate", verifyJWT, activatePrivateChat);
router.post("/group", verifyJWT, startGroupChat);
// router.get("/:userId", getUserConversations);
// router.delete("/:conversationId", deleteConversation);

export default router;
