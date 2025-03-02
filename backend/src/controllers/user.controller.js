import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";

const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { phone: { $regex: query, $options: "i" } },
    ],
  });
  if (users)
    return res.status(200).json(new ApiResponse(200, users, "Users retrieved"));
  throw new ApiError(404, "User not found");
});

const getUserProfile = asyncHandler(async (req, res) => {});
const updateUserProfile = asyncHandler(async (req, res) => {});
const updateUserStatus = asyncHandler(async (req, res) => {});

export { searchUsers, getUserProfile, updateUserProfile, updateUserStatus };
