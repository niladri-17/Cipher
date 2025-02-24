import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },
    media: [{ type: String }], // Image, video, file URL
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who read the message
    isDeleted: {
      type: Number,
      enum: [0, 1, 2],
      default: 0
    } // 0 -> not deleted, 1 -> deleted for me, 2 -> deleted for everyone
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
