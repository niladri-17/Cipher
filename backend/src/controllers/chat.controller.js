import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { addGroupMember } from "./group.controller.js";

const getAllChats = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString(); // Convert ObjectId to string

  const chats = await Chat.find({
    members: userId,
    inactive: { $ne: userId },
  })
    .populate({
      path: "members",
      select: "fullName email profilePic status lastSeen",
    })
    .populate({
      path: "lastMessage",
      select: "sender text createdAt",
      populate: {
        path: "sender",
        select: "fullName profilePic",
      },
    })
    .sort({ updatedAt: -1 })
    .lean(); // Converts Mongoose objects to plain JavaScript objects

  // Calculate unseen message count for each chat
  await Promise.all(
    chats.map(async (chat) => {
      // More robust way to handle the lastSeen array
      let lastSeenTime = new Date(0); // Default to oldest possible date

      // Check if lastSeen exists and is an array
      if (Array.isArray(chat.lastSeen)) {
        // Find the entry manually with a for loop to avoid potential issues with .find()
        for (let i = 0; i < chat.lastSeen.length; i++) {
          const entry = chat.lastSeen[i];
          if (entry && entry.userId && entry.userId.toString() === userId) {
            if (entry.lastSeenAt) {
              lastSeenTime = new Date(entry.lastSeenAt);
            }
            break;
          }
        }
      }

      const unseenCount = await Message.countDocuments({
        chatId: chat._id,
        createdAt: { $gt: lastSeenTime },
        seenBy: { $ne: userId },
      });

      chat.unseenCount = unseenCount; // Add unseenCount field to chat
    })
  );

  // console.log(chats); // Now each chat includes unseenCount

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
    $or: [
      // Search group chats by name
      { groupName: { $regex: query, $options: "i" } },

      // For private chats, we need to use a different approach
      {
        $and: [
          // Check if it's a private chat
          { isGroup: false },
          // Use $elemMatch on the members field specifically
          {
            members: {
              $elemMatch: {
                $ne: currentUserId, // Exclude current user
                $in: (
                  await User.find({
                    fullName: { $regex: query, $options: "i" },
                  }).select("_id")
                ).map((user) => user._id),
              },
            },
          },
        ],
      },
    ],
  })
    .populate({
      path: "members",
      select: "fullName email profilePic status lastSeen",
      populate: {
        path: "lastSeen",
        select: "userId lastSeenAt",
      },
    })
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
  const usersWithNoPrivateChats = await User.aggregate([
    // Find all users except the current user
    {
      $match: {
        _id: { $ne: currentUserId },
        fullName: { $regex: query, $options: "i" },
      },
    },
    // Look for private chats with these users
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
                  { $eq: ["$isGroup", false] }, // Only check private chats
                  { $not: { $in: [currentUserId, "$inactive"] } }, // Current user is not inactive
                ],
              },
            },
          },
        ],
        as: "existingPrivateChats",
      },
    },
    // Only keep users who have no private chats with current user
    {
      $match: {
        existingPrivateChats: { $size: 0 },
      },
    },
    // Keep relevant fields
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        lastSeen: 1,
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
    contacts: usersWithNoPrivateChats || [],
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
      .populate({
        path: "members",
        select: "fullName email profilePic status lastSeen",
      })
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
    .populate({
      path: "members",
      select: "fullName email profilePic status lastSeen",
    })
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
      chat.members.forEach((member) => {
        const memberId = member._id;
        const receiverSocketId = getReceiverSocketId(memberId);
        if (receiverSocketId) {
          // Emit "newChat" event with the chat details
          io.to(receiverSocketId).emit("newChat", chat);
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

const deleteChat = asyncHandler(async (req, res) => {
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
    $addToSet: { inactive: userId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const exitGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id.toString();

  const chat = await Chat.findOne({ _id: chatId, members: userId });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Ensure user is actually in the members list
  if (!chat.members.some((member) => member.toString() === userId)) {
    throw new ApiError(400, "User is not a member of this chat");
  }

  // If the user is the last admin, assign a new admin
  if (chat.admins.length === 1 && chat.admins[0].toString() === userId) {
    const newAdmin = chat.members.find(
      (member) => member.toString() !== userId
    );
    if (newAdmin) {
      await Chat.findByIdAndUpdate(chatId, { $set: { admins: [newAdmin] } });
    }
  }

  // Remove user and update necessary fields in a single query
  await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        clearHistory: { userId: userId }, // Remove previous history
        admins: userId, // Remove from admins if present
        members: userId, // Remove from members
      },
      $push: {
        clearHistory: {
          userId: userId,
          clearedAt: new Date(),
        },
      },
      $addToSet: { inactive: userId }, // Add to inactive list (prevent duplicates)
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Exited group successfully"));
});

// editGroupNameOrAddGroupMember
// removeGroupMember


export {
  getAllChats,
  searchAllChats,
  startPrivateChat,
  activatePrivateChat,
  startGroupChat,
  clearChat,
  deleteChat,
  exitGroup,
};
