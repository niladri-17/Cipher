import Message from "../models/message.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId, text } = req.body;
  const mediaPath = req.file?.path;
  const sender = req.user._id;

  if (!chatId) {
    throw new ApiError(400, "chatId is required");
  }

  if (!text && !media) {
    throw new ApiError(400, "text or media is required");
  }

  if (mediaPath) {
    const media = await uploadOnCloudinary(mediaPath);
    if (!media?.url) {
      throw new ApiError(500, "Failed to upload media");
    }
  }

  const message = Message.create({ chatId, sender, text, media });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

const getMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

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
