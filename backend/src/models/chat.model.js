import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    inactive: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    clearHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        clearedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    groupAvatar: {
      type: String,
      default: "",
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    deleteHistory: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    lastSeen: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        lastSeenAt: {
          type: Date,
          default: null,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

chatSchema.index({ members: 1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
