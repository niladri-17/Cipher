import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  updateUserStatus,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateUserProfile);
router.get("/search", searchUsers);
router.put("/status/:id", updateUserStatus);

export default router;
