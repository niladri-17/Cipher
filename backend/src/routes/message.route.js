import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  signup,
  login,
  logout,
  updateProfilePic,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/signup").post(signup); // or, router.post("/signup", signup);

export default router;
