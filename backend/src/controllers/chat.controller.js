import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const getAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Authenticated user's ID

  // ✅ Fetch chats where the user is a participant
  const chats = await Chat.find({
    // User must be a member AND not in inactive list
    members: userId,
    inactive: { $ne: userId },
    // No delete history for this user
    $nor: [
      {
        deleteHistory: {
          $elemMatch: {
            userId: userId,
            deletedAt: { $exists: true, $ne: null },
          },
        },
      },
    ],
  })
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

const searchAllChats = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.user._id;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Get chats where user is a member

  const chats = await Chat.find({
    // User must be a member AND not in inactive list
    members: currentUserId,
    inactive: { $ne: currentUserId },
    // No delete history for this user
    $nor: [
      {
        deleteHistory: {
          $elemMatch: {
            userId: currentUserId,
            deletedAt: { $exists: true, $ne: null },
          },
        },
      },
    ],
    // Match either groupName (if group) or member's fullName (if private chat)
    $or: [
      { groupName: { $regex: query, $options: "i" } }, // Case-insensitive search for groups
      {
        // Search for private chat members (excluding current user)
        $and: [
          { isGroup: false },
          {
            members: {
              $elemMatch: {
                _id: { $ne: currentUserId }, // Exclude current user
                fullName: { $regex: query, $options: "i" }, // Match other member's name
              },
            },
          },
        ],
      },
    ],
  })
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

  // Get users who don't have any chats with current user
  const usersWithNoChats = await User.aggregate([
    // Find all users except the current user
    {
      $match: {
        _id: { $ne: currentUserId },
        fullName: { $regex: query, $options: "i" },
      },
    },
    // Look for chats with these users
    {
      $lookup: {
        from: "chats",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$userId", "$members"] },
                  { $in: [currentUserId, "$members"] },
                ],
              },
            },
          },
        ],
        as: "existingChats",
      },
    },
    // Only keep users who have no chat OR have a chat where currentUserId is inactive
    {
      $match: {
        $or: [
          { existingChats: { $size: 0 } }, // No chats exist
          {
            existingChats: {
              $elemMatch: { inactive: currentUserId },
            },
          }, // Chats exist but currentUserId is in inactive array
        ],
      },
    },
    // Keep relevant fields
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
      },
    },
  ]);

  // Get messages containing the query text
  // const messages = await Message.find({
  //   chatId: { $in: chats.map((chat) => chat._id) },
  //   text: { $regex: query, $options: "i" },
  //   isDeleted: false,
  //   isVisible: true,
  // })
  //   .populate("chatId", "groupName members")
  //   .populate("sender", "fullName email")
  //   .sort({ createdAt: -1 })
  //   .lean();
  let messages;

  const data = {
    chats: chats || [],
    contacts: usersWithNoChats || [],
    messages: messages || [],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Search results fetched successfully"));
});

// Start Private chat
const startPrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user._id;

  // Validate request
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if trying to chat with self
  if (userId === currentUserId.toString()) {
    throw new ApiError(400, "Cannot start chat with yourself");
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Check for existing chat
  const existingChat = await Chat.findOne({
    isGroup: false,
    members: { $all: [currentUserId, userId] },
  });

  if (existingChat) {
    // Populate the existing chat
    const populatedChat = await Chat.findById(existingChat._id)
      .populate("members", "fullName email profilePic status")
      .populate({
        path: "lastMessage",
        select: "sender text createdAt",
        populate: {
          path: "sender",
          select: "fullName profilePic",
        },
      });

    return res
      .status(200)
      .json(new ApiResponse(200, populatedChat, "Chat exists"));
  }

  // Create new chat
  const newChat = await Chat.create({
    members: [currentUserId, userId],
    inactive: [currentUserId], // Make it an array since multiple users could be inactive
    isGroup: false,
  });

  // Populate the new chat
  const populatedNewChat = await Chat.findById(newChat._id)
    .populate("members", "fullName email profilePic status")
    .populate({
      path: "lastMessage",
      select: "sender text createdAt",
      populate: {
        path: "sender",
        select: "fullName profilePic",
      },
    });

  return res
    .status(201)
    .json(new ApiResponse(201, populatedNewChat, "Chat started"));
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

    const chat = await Chat.findById(newGroup._id)
      .populate("members", "fullName email profilePic status")
      .populate({
        path: "lastMessage",
        select: "sender text createdAt",
        populate: {
          path: "sender",
          select: "fullName profilePic",
        },
      });

    if (chat) {
      // Send the new message to all members except the sender
      chat.members.forEach((memberId) => {
        if (memberId.toString() !== sender.toString()) {
          const receiverSocketId = getReceiverSocketId(memberId);
          if (receiverSocketId) {
            // Emit "newMessage" event with the message
            io.to(receiverSocketId).emit("newMessage", populatedMessage);

            // Emit "newChat" event with the chat details
            io.to(receiverSocketId).emit("newChat", chat);
          }
        }
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newGroup, "Group created"));
  }

  throw new ApiError(400, "Invalid request");
});

const activatePrivateChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { inactive: userId }, // Uses $pull to remove userId from the inactive array
    },
    { new: true }
  );
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }
  return res.status(200).json(new ApiResponse(200, chat, "Chat activated"));
});

const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findOne({
    _id: chatId,
    members: userId,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Update or add clearHistory entry for this user
  await Chat.findByIdAndUpdate(chatId, {
    $pull: { clearHistory: { userId: userId } }, // Remove old entry if exists
  });

  await Chat.findByIdAndUpdate(chatId, {
    $push: {
      clearHistory: {
        userId: userId,
        clearedAt: new Date(),
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat cleared successfully"));
});

// exports.deleteChat = (req, res) => {};

export {
  getAllChats,
  searchAllChats,
  startPrivateChat,
  activatePrivateChat,
  startGroupChat,
};
