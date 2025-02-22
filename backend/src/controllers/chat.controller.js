import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Authenticated user's ID

  // ✅ Fetch chats where the user is a participant
  const chats = await Chat.find({ members: userId })
    .populate("members", "fullName email profilePic status")
    .populate({
      path: "lastMessage",
      select: "sender text createdAt",
      populate: {
        path: "sender",
        select: "fullName profilePic",
      },
    })
    .sort({ updatedAt: -1 });

  return res.status(200).json(new ApiResponse(200, chats, "Chats fetched"));
});

// Start Private chat
const startPrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user._id; // From authMiddleware

  if (userId) {
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, userId] },
    });

    if (existingChat) {
      return res
        .status(200)
        .json(new ApiResponse(200, existingChat, "Chat exists"));
    }

    const newChat = await Chat.create({
      participants: [currentUserId, userId],
      isGroup: false,
    });

    return res.status(201).json(new ApiResponse(201, newChat, "Chat started"));
  }

  throw new ApiError(400, "Invalid request");
});

// start Group chat
const startGroupChat = asyncHandler(async (req, res) => {
  const { userIds, groupName } = req.body;
  const currentUserId = req.user._id; // From authMiddleware

  // 🟢 2️⃣ Group Chat
  if (userIds && userIds.length > 0) {
    if (!groupName) {
      throw new ApiError(400, "Group name is required");
    }

    // Ensure the current user is part of the group
    if (!userIds.includes(currentUserId.toString())) {
      userIds.push(currentUserId.toString());
    }

    const newGroup = await Chat.create({
      members: userIds,
      isGroup: true,
      groupName,
      admins: currentUserId,
      createdBy: currentUserId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, newGroup, "Group created"));
  }

  throw new ApiError(400, "Invalid request");
});

// exports.deleteChat = (req, res) => {};

export { getAllChats, startPrivateChat, startGroupChat };
