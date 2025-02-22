// Assuming we have access to users and chats arrays from previous seeds
const mongoose = require('mongoose');
const createObjectId = () => new mongoose.Types.ObjectId();

const getRandomUsers = (chat, count) => {
  return chat.members.slice(0, count);
};

// Helper to create timestamps in sequence
const getTimestamp = (hoursAgo) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

const messages = [
  // Development Team Group Chat (chat[3])
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[0]._id, // John
    text: "Team, here's our sprint planning for next week",
    media: "https://example.com/files/sprint-plan.pdf",
    seenBy: getRandomUsers(chats[3], 4),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(48)
  },
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[1]._id, // Jane
    text: "I'll handle the API endpoints",
    seenBy: getRandomUsers(chats[3], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(47)
  },
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[2]._id, // Michael
    text: "I can work on the frontend components",
    seenBy: getRandomUsers(chats[3], 5),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(46)
  },

  // John and Jane DM (chat[0])
  {
    _id: createObjectId(),
    chatId: chats[0]._id,
    sender: users[0]._id,
    text: "How's the API documentation coming along?",
    seenBy: [users[0]._id, users[1]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(24)
  },
  {
    _id: createObjectId(),
    chatId: chats[0]._id,
    sender: users[1]._id,
    text: "Almost done! Just reviewing the authentication section",
    seenBy: [users[0]._id, users[1]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(23)
  },

  // Project Alpha Team (chat[1])
  {
    _id: createObjectId(),
    chatId: chats[1]._id,
    sender: users[0]._id,
    text: "Project update meeting at 2 PM",
    seenBy: getRandomUsers(chats[1], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(12)
  },
  {
    _id: createObjectId(),
    chatId: chats[1]._id,
    sender: users[2]._id,
    text: "I'll prepare the progress report",
    media: "https://example.com/files/progress.xlsx",
    seenBy: getRandomUsers(chats[1], 2),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(11)
  },

  // Design Team (chat[5])
  {
    _id: createObjectId(),
    chatId: chats[5]._id,
    sender: users[6]._id,
    text: "New design system components ready for review",
    media: "https://example.com/files/design-system.fig",
    seenBy: getRandomUsers(chats[5], 4),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(36)
  },
  {
    _id: createObjectId(),
    chatId: chats[5]._id,
    sender: users[7]._id,
    text: "Looking great! Just a few comments on the color palette",
    seenBy: getRandomUsers(chats[5], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(35)
  },

  // All Company (chat[7])
  {
    _id: createObjectId(),
    chatId: chats[7]._id,
    sender: users[0]._id,
    text: "Company meeting next Monday at 10 AM",
    seenBy: users.map(user => user._id),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(72)
  },
  {
    _id: createObjectId(),
    chatId: chats[7]._id,
    sender: users[4]._id,
    text: "Don't forget to submit your quarterly reports by Friday",
    seenBy: getRandomUsers(chats[7], 8),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(48)
  },

  // Michael and Robert DM (chat[6])
  {
    _id: createObjectId(),
    chatId: chats[6]._id,
    sender: users[2]._id,
    text: "Can you review my pull request?",
    seenBy: [users[2]._id, users[8]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(5)
  },
  {
    _id: createObjectId(),
    chatId: chats[6]._id,
    sender: users[8]._id,
    text: "Sure, I'll look at it in 30 minutes",
    seenBy: [users[2]._id, users[8]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(4)
  },

  // Weekend Project (chat[9])
  {
    _id: createObjectId(),
    chatId: chats[9]._id,
    sender: users[1]._id,
    text: "Here's the project timeline",
    media: "https://example.com/files/timeline.pdf",
    seenBy: getRandomUsers(chats[9], 2),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(28)
  },
  {
    _id: createObjectId(),
    chatId: chats[9]._id,
    sender: users[5]._id,
    text: "I can start with the initial setup",
    seenBy: getRandomUsers(chats[9], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(27)
  },

  // Emily and Maria DM (chat[8])
  {
    _id: createObjectId(),
    chatId: chats[8]._id,
    sender: users[3]._id,
    text: "Did you see the latest design mockups?",
    seenBy: [users[3]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(2)
  },
  {
    _id: createObjectId(),
    chatId: chats[8]._id,
    sender: users[9]._id,
    text: "Not yet, I'll check them now",
    seenBy: [users[3]._id, users[9]._id],
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(1)
  },

  // Additional messages for active chats
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[4]._id,
    text: "Weekly status update: Backend deployment successful",
    seenBy: getRandomUsers(chats[3], 4),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(10)
  },
  {
    _id: createObjectId(),
    chatId: chats[1]._id,
    sender: users[3]._id,
    text: "Testing phase completed",
    media: "https://example.com/files/test-results.pdf",
    seenBy: getRandomUsers(chats[1], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(8)
  },
  {
    _id: createObjectId(),
    chatId: chats[5]._id,
    sender: users[8]._id,
    text: "Updated the component library documentation",
    seenBy: getRandomUsers(chats[5], 2),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(6)
  },
  {
    _id: createObjectId(),
    chatId: chats[7]._id,
    sender: users[1]._id,
    text: "New office policies document available on SharePoint",
    media: "https://example.com/files/policies.pdf",
    seenBy: getRandomUsers(chats[7], 7),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(30)
  },

  // Messages with deleted/invisible status
  {
    _id: createObjectId(),
    chatId: chats[0]._id,
    sender: users[0]._id,
    text: "Wrong chat, sorry!",
    seenBy: [users[0]._id],
    isDeleted: true,
    isVisible: false,
    createdAt: getTimestamp(25)
  },
  {
    _id: createObjectId(),
    chatId: chats[6]._id,
    sender: users[2]._id,
    text: "Draft message",
    seenBy: [users[2]._id],
    isDeleted: false,
    isVisible: false,
    createdAt: getTimestamp(3)
  },

  // Messages with various media types
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[2]._id,
    text: "Check out this demo video",
    media: "https://example.com/files/demo.mp4",
    seenBy: getRandomUsers(chats[3], 3),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(15)
  },
  {
    _id: createObjectId(),
    chatId: chats[5]._id,
    sender: users[7]._id,
    text: "Updated logo designs",
    media: "https://example.com/files/logos.zip",
    seenBy: getRandomUsers(chats[5], 4),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(20)
  },
  {
    _id: createObjectId(),
    chatId: chats[1]._id,
    sender: users[0]._id,
    text: "Project timeline",
    media: "https://example.com/files/timeline.png",
    seenBy: getRandomUsers(chats[1], 2),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(18)
  },

  // Recent messages
  {
    _id: createObjectId(),
    chatId: chats[3]._id,
    sender: users[1]._id,
    text: "Deployment scheduled for tomorrow",
    seenBy: getRandomUsers(chats[3], 2),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(1)
  },
  {
    _id: createObjectId(),
    chatId: chats[7]._id,
    sender: users[0]._id,
    text: "Don't forget about the team building event next week!",
    seenBy: getRandomUsers(chats[7], 5),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(0.5)
  },
  {
    _id: createObjectId(),
    chatId: chats[5]._id,
    sender: users[6]._id,
    text: "Final design review at 3 PM",
    seenBy: getRandomUsers(chats[5], 1),
    isDeleted: false,
    isVisible: true,
    createdAt: getTimestamp(0.1)
  }
];

// Update chats with their last messages
const updateChatsWithLastMessages = () => {
  chats.forEach(chat => {
    const chatMessages = messages.filter(
      msg => msg.chatId.toString() === chat._id.toString() && !msg.isDeleted && msg.isVisible
    );
    if (chatMessages.length > 0) {
      chat.lastMessage = chatMessages[chatMessages.length - 1]._id;
    }
  });
};

updateChatsWithLastMessages();

module.exports = {
  messages,
  updateChatsWithLastMessages
};
