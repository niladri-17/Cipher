import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  updateUserStatus,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile/:id", verifyJWT, getUserProfile);
router.put("/profile/:id", verifyJWT, updateUserProfile);
router.get("/search", verifyJWT, searchUsers);
router.put("/status/:id", verifyJWT, updateUserStatus);

export default router;
