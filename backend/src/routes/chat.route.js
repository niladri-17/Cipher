import express from "express";
import { startSingleChat} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", startSingleChat);
// router.get("/:userId", getUserConversations);
// router.delete("/:conversationId", deleteConversation);

export default router;
