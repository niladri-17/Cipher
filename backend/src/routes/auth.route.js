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

// EMAIL LOGIN
router.route("/login").post(login);

// GOOGLE LOGIN
router.post("/google-login", googleLogin);

// PHONE LOGIN
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.route("/refresh-token").get(refreshAccessToken);

router.route("/logout").post(verifyJWT, logout); // or, router.post("/logout", verifyJWT, logout);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("profilePic"), updateProfilePic);

export default router;
