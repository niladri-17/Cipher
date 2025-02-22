// Assuming we have the users array from the previous seed data
import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import Chat from "../models/chat.model.js";
import mongoose from "mongoose";
import users from "./user.seed.js";

config();

const createObjectId = () => new mongoose.Types.ObjectId();

const seedChats = [
  {
    _id: createObjectId(),
    members: [users[0]._id, users[1]._id], // John and Jane
    isGroup: false,
    lastMessage: null, // Will be set when we create messages
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[0]._id, users[2]._id, users[3]._id], // John, Michael, and Emily
    isGroup: true,
    groupName: "Project Alpha Team",
    groupAvatar: "https://example.com/groups/project-alpha.jpg",
    admins: [users[0]._id],
    lastMessage: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[1]._id, users[4]._id], // Jane and David
    isGroup: false,
    lastMessage: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[0]._id, users[1]._id, users[2]._id, users[3]._id, users[4]._id], // Development Team
    isGroup: true,
    groupName: "Development Team",
    groupAvatar: "https://example.com/groups/dev-team.jpg",
    admins: [users[0]._id, users[1]._id],
    lastMessage: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[5]._id, users[6]._id], // Sarah and James
    isGroup: false,
    lastMessage: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[6]._id, users[7]._id, users[8]._id, users[9]._id], // Design Team
    isGroup: true,
    groupName: "Design Team",
    groupAvatar: "https://example.com/groups/design-team.jpg",
    admins: [users[6]._id],
    lastMessage: null,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[2]._id, users[8]._id], // Michael and Robert
    isGroup: false,
    lastMessage: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: users.map(user => user._id), // All Company
    isGroup: true,
    groupName: "All Company",
    groupAvatar: "https://example.com/groups/all-company.jpg",
    admins: [users[0]._id, users[4]._id],
    lastMessage: null,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[3]._id, users[9]._id], // Emily and Maria
    isGroup: false,
    lastMessage: null,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: createObjectId(),
    members: [users[1]._id, users[5]._id, users[7]._id], // Weekend Project
    isGroup: true,
    groupName: "Weekend Project",
    groupAvatar: "https://example.com/groups/weekend-project.jpg",
    admins: [users[1]._id],
    lastMessage: null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

const seedDatabase = async () => {
    try {
      await connectDB();

      await Chat.insertMany(seedChats);
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };

  // Call the function
  seedDatabase();
