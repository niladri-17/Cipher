import { Server } from "socket.io";
import http from "http";
import express from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
const activeChats = {}; // Format: { chatId: Set([userId1, userId2, ...]) }

// Add a user to active chat
export const addUserToActiveChat = async (chatId, userId) => {
  if (!activeChats[chatId]) {
    activeChats[chatId] = new Set();
  }
  activeChats[chatId].add(userId.toString());
  await Message.updateMany(
    {
      chatId: chatId,
      seenBy: { $ne: userId }, // Only update messages not already seen by this user
    },
    {
      $addToSet: { seenBy: userId }, // Add userId to seenBy array if not already there
    }
  );
};

// Remove a user from active chat
export const removeUserFromActiveChat = async (chatId, userId) => {
  if (activeChats[chatId]) {
    await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $pull: { lastSeen: { userId: userId } },
      }
    );

    await Chat.findOneAndUpdate(
      { _id: chatId },
      {
        $push: { lastSeen: { userId: userId, lastSeenAt: new Date() } },
      }
    );

    activeChats[chatId].delete(userId.toString());
    if (activeChats[chatId].size === 0) {
      delete activeChats[chatId];
    }
  }
};

// Get all active users in a chat
export const getActiveUsersInChat = (chatId) => {
  console.log(activeChats);
  if (!activeChats[chatId]) return [];
  return Array.from(activeChats[chatId]);
};

io.on("connection", (socket) => {
  // console.log("A user connected", socket.id);
  console.log("socket map:", userSocketMap);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinChat", ({ chatId, userId }) => {
    socket.join(chatId);
    addUserToActiveChat(chatId, userId);

    // Store for cleanup on disconnect
    socket.userId = userId;

    // Track which chats this socket is in
    if (!socket.activeChatRooms) {
      socket.activeChatRooms = [];
    }
    socket.activeChatRooms.push(chatId);
    console.log("active chats after joining:", activeChats);
  });

  // When a user leaves a chat
  socket.on("leaveChat", ({ chatId, userId }) => {
    socket.leave(chatId);
    removeUserFromActiveChat(chatId, userId);

    // Remove from tracked rooms
    if (socket.activeChatRooms) {
      socket.activeChatRooms = socket.activeChatRooms.filter(
        (id) => id !== chatId
      );
    }
    console.log("active chat after leaving:", activeChats);
  });

  socket.on("disconnect", async () => {
    // console.log("A user disconnected", socket.id);
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    if (socket.userId && socket.activeChatRooms) {
      // Clean up all active chats for this user
      socket.activeChatRooms.forEach((chatId) => {
        removeUserFromActiveChat(chatId, socket.userId);
      });
    }
  });
});

export { io, app, server };
