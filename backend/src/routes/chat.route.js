import express from "express";
import {getAllChats, startPrivateChat, startGroupChat} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/all", verifyJWT, getAllChats);
router.post("/private", verifyJWT, startPrivateChat);
router.post("/group", verifyJWT, startGroupChat);
// router.get("/:userId", getUserConversations);
// router.delete("/:conversationId", deleteConversation);

export default router;
