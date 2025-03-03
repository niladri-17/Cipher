const { asyncHandler } = require("../utils/asyncHandler");

exports.createGroup = asyncHandler(async (req, res) => {
  const { userIds, groupName } = req.body;
  const currentUserId = req.user._id; // From authMiddleware

  if (!userIds || userIds.length === 0 || !groupName) {
    return res
      .status(400)
      .json({ success: false, message: "Group name and users are required" });
  }

  // Ensure the current user is in the group
  if (!userIds.includes(currentUserId.toString())) {
    userIds.push(currentUserId.toString());
  }

  // ✅ Create a new group conversation
  const newGroup = await Conversation.create({
    participants: userIds,
    isGroup: true,
    groupName,
    createdBy: currentUserId,
  });

  return res.status(201).json({ success: true, conversation: newGroup });
});
exports.addGroupMember = (req, res) => {};
exports.removeGroupMember = (req, res) => {};

