import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

import mongoose from "mongoose";

config();

const createObjectId = () => new mongoose.Types.ObjectId();

 const seedUsers = [
    {
      _id: createObjectId(),
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/john.jpg",
      status: "online",
      lastSeen: new Date()
    },
    {
      _id: createObjectId(),
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1234567891",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/jane.jpg",
      status: "offline",
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1234567892",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/michael.jpg",
      status: "busy",
      lastSeen: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "Emily Johnson",
      email: "emily.j@example.com",
      phone: "+1234567893",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/emily.jpg",
      status: "online",
      lastSeen: new Date()
    },
    {
      _id: createObjectId(),
      fullName: "David Wilson",
      email: "david.wilson@example.com",
      phone: "+1234567894",
      googleId: "google123456",
      profilePic: "https://example.com/profiles/david.jpg",
      status: "offline",
      lastSeen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "Sarah Martinez",
      email: "sarah.m@example.com",
      phone: "+1234567895",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/sarah.jpg",
      status: "busy",
      lastSeen: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "James Anderson",
      email: "james.a@example.com",
      phone: "+1234567896",
      googleId: "google789012",
      profilePic: "https://example.com/profiles/james.jpg",
      status: "online",
      lastSeen: new Date()
    },
    {
      _id: createObjectId(),
      fullName: "Lisa Taylor",
      email: "lisa.taylor@example.com",
      phone: "+1234567897",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/lisa.jpg",
      status: "offline",
      lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "Robert Chen",
      email: "robert.chen@example.com",
      phone: "+1234567898",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/robert.jpg",
      status: "busy",
      lastSeen: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      _id: createObjectId(),
      fullName: "Maria Garcia",
      email: "maria.g@example.com",
      phone: "+1234567899",
      password: "$2b$10$hXDnye/.bAEGBAzKf38WruC3q5xX1FFQ15F2mwvKjoQHpCtjvDJy.",
      profilePic: "https://example.com/profiles/maria.jpg",
      status: "online",
      lastSeen: new Date()
    }
  ];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();


export default seedUsers;
