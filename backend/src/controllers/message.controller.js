import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../lib/socket.js";

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

    // 1. Create the message with session
    const newMessage = await Message.create(
      [
        {
          chatId,
          sender,
          text,
          media,
          seenBy: [sender], // Mark as seen by sender
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
    const chat = await Chat.findById(chatId);
    if (chat) {
      // Send to all members except sender
      chat.members.forEach((memberId) => {
        if (memberId.toString() !== sender.toString()) {
          const receiverSocketId = getReceiverSocketId(memberId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
          }
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
  const messages = await Message.find({ chatId })
    .populate("sender", "fullName email phone")
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
