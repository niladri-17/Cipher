const mongoose = require("mongoose");

const typingSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    typing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

typingSchema.index({ conversationId: 1, user: 1 });

module.exports = mongoose.model("Typing", typingSchema);
