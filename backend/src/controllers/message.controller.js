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

export { sendMessage };

exports.getMessages = (req, res) => {};
exports.updateMessage = (req, res) => {};
exports.deleteMessage = (req, res) => {};
exports.markMessageAsSeen = (req, res) => {};
