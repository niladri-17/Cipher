import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true, // This cookie cannot be accessed by client side javascript
  secure: true, // This cookie can only be sent over https
  sameSite: "none", // This cookie will be sent with cross-origin requests
};

const generateAccessAndRefereshTokens = async (user, session) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ session, validateBeforeSave: false }); // Save inside transaction // Don't validate every fields again before save

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const authCheck = (req, res) => {
  try {
    return res.status(200).json(new ApiResponse(200, req.user, ""));
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    throw new ApiError(500, "Something went wrong");
  }
};

const signup = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fullName, email, password } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      [fullName, email, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
      throw new ApiError(400, "User with this email already exists");
    }

    const userArray = await User.create([{ fullName, email, password }], {
      session,
    });
    const user = userArray[0]; // Since we use an array, extract the first user

    // Generate tokens inside the transaction using the created user
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user,
      session
    );

    // Commit transaction only if everything succeeds
    await session.commitTransaction();
    session.endSession();

    // Fetch user after commit
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: createdUser,
            accessToken,
            refreshToken,
          },
          "User Registered Successfully"
        )
      );
  } catch (error) {
    await session.abortTransaction(); // Rollback everything
    session.endSession();

    throw new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong while registering the user"
    );
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  if (!password) {
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ googleId, email, name, avatar, status: "online" });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Google login failed!" });
  }
};

// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// 🔹 Send OTP via Twilio
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
    const otpExpires = Date.now() + 5 * 60 * 1000; // Expires in 5 mins

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({ phone, otp, otpExpires });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }

    await user.save();

    // Send OTP via Twilio
    await twilioClient.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "OTP sending failed!" });
  }
};

// 🔹 Verify OTP and authenticate user
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed!" });
  }
};

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token has expired. Please login again");
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user);

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: newAccessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const profilePicLocalPath = req.file?.path;

  if (!profilePicLocalPath) {
    throw new ApiError(400, "Profile Picture is missing");
  }

  // delete old image from cloudinary
  let user = await User.findById(req.user?._id);

  if (user?.profilePic) {
    const publicId = user.profilePic.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  const profilePic = await uploadOnCloudinary(profilePicLocalPath);

  if (!profilePic?.url) {
    throw new ApiError(500, "Something went wrong while uploading profile pic");
  }

  user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePic: profilePic.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile picture updated successfully"));
});

export {
  authCheck,
  signup,
  login,
  googleLogin,
  sendOtp,
  verifyOtp,
  logout,
  updateProfilePic,
  refreshAccessToken,
};
