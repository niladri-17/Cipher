import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// 🔹 Start a Chat (One-to-One or Group)
const startSingleChat = asyncHandler(async (req, res) => {
  const { userId, userIds, groupName } = req.body;
  const currentUserId = req.user._id; // From authMiddleware

  // 🟢 1️⃣ One-to-One Chat
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

  // 🟢 2️⃣ Group Chat
//   if (userIds && userIds.length > 0) {
//     if (!groupName) {
//       throw new ApiError(400, "Group name is required");
//     }

//     // Ensure the current user is part of the group
//     if (!userIds.includes(currentUserId.toString())) {
//       userIds.push(currentUserId.toString());
//     }

//     const newGroup = await Chat.create({
//       participants: userIds,
//       isGroup: true,
//       groupName,
//       createdBy: currentUserId,
//     });

//     return res
//       .status(201)
//       .json(new ApiResponse(201, newGroup, "Group created"));
//   }

  return res
    .status(400)
    .json({ success: false, message: "Invalid request parameters" });
});

// exports.getUserChats = (req, res) => {};
// exports.deleteChat = (req, res) => {};

export { startSingleChat };
