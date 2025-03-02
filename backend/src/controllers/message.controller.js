import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import {
  getReceiverSocketId,
  getActiveUsersInChat,
  io,
} from "../lib/socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const chatId = req.params.chatId;
    const mediaPath = req.file?.path;
    const sender = req.user._id;
    const { text } = req.body;
    let { media } = req.body;

    if (!chatId) {
      throw new ApiError(400, "chatId is required");
    }

    if (!text && !media && !mediaPath) {
      throw new ApiError(400, "text or media is required");
    }

    // Handle media upload before creating message
    if (mediaPath) {
      const uploadedMedia = await uploadOnCloudinary(mediaPath);
      if (!uploadedMedia?.url) {
        throw new ApiError(500, "Failed to upload media");
      }
      media = uploadedMedia.url; // Set the media URL from Cloudinary
    }

    // Get active users for this chat
    const activeUsers = getActiveUsersInChat(chatId); // You'll need to implement this function

    // Initialize seenBy with the sender
    const seenBy = [sender];

    // Add any active users to seenBy (except sender)
    if (activeUsers && activeUsers.length > 0) {
      activeUsers.forEach((userId) => {
        if (
          userId.toString() !== sender.toString() &&
          !seenBy.includes(userId)
        ) {
          seenBy.push(userId);
        }
      });
    }

    // 1. Create the message with session and the enhanced seenBy array
    const newMessage = await Message.create(
      [
        {
          chatId,
          sender,
          text,
          media,
          seenBy, // Now includes sender and any active users
        },
      ],
      { session }
    );

    const createdMessage = newMessage[0];

    // 2. Update the lastMessage field in the Chat model
    await Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: createdMessage._id, updatedAt: new Date() },
      { new: true, session }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Only now, after successful transaction, populate the sender details
    const populatedMessage = await Message.findById(
      createdMessage._id
    ).populate("sender", "fullName profilePic");

    // Handle socket events after successful transaction
    const chat = await Chat.findById(chatId)
      .populate("members", "fullName email profilePic status")
      .populate({
        path: "lastMessage",
        select: "sender text createdAt",
        populate: {
          path: "sender",
          select: "fullName profilePic",
        },
      })
      .lean();

    console.log(`active users in chatId ${chatId} : \n` + activeUsers);

    // If the chat exists and has members, send notifications to all members
    if (chat && chat.members?.length > 0) {
      chat.members.forEach(async (member) => {
        const receiverSocketId = getReceiverSocketId(member._id.toString());
        if (receiverSocketId) {
          // Send the new message to all members except the sender and updated/new chat to all online members
          // Ensure IDs are strings for comparison
          if (member._id.toString() !== sender.toString()) {
            // Emit "newMessage" event with the message
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
          }
          let lastSeenTime = new Date(0); // Default to oldest possible date

          // Check if lastSeen exists and is an array
          if (Array.isArray(chat.lastSeen)) {
            // Find the entry manually with a for loop to avoid potential issues with .find()
            for (let i = 0; i < chat.lastSeen.length; i++) {
              const entry = chat.lastSeen[i];
              if (entry && entry.userId && entry.userId.toString() === member._id) {
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
            seenBy: { $ne: member._id },
          });

          chat.unseenCount = unseenCount; // Add unseenCount field to chat

          // Emit "newChat" event with the chat details
          io.to(receiverSocketId).emit("newChat", chat);
        }
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, populatedMessage, "Message sent"));
  } catch (error) {
    // Only abort if the transaction is active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    // Always end the session
    session.endSession();
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.user._id;

  const chat = await Chat.findOne({
    _id: chatId,
    members: userId,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Find when this user last cleared the chat
  const userClearHistory = chat.clearHistory.find(
    (history) => history.userId.toString() === userId.toString()
  );

  // Build query based on clear history
  const query = {
    chatId,
    $nor: [{ "isDeletedFor.userId": userId }]
  };

  // Only add timestamp check if user has cleared chat before
  if (userClearHistory) {
    query.createdAt = { $gt: userClearHistory.clearedAt };
  }

  const messages = await Message.find(query)
    .populate("sender", "fullName email phone profilePic")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages retrieved"));
});

const updateMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const { text } = req.body;

  if (!text) {
    throw new ApiError(400, "text is required");
  }

  const message = await Message.findByIdAndUpdate(
    messageId,
    { text },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, message, "Message updated"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  await Message.findByIdAndDelete(messageId);

  return res.status(200).json(new ApiResponse(200, null, "Message deleted"));
});

const markMessageAsSeen = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { seenBy: req.user._id } }, // $addToSet ensures unique values in the array
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as seen"));
});

export {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  markMessageAsSeen,
};
