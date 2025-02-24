import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import { io, app } from "./lib/socket.js";

// cors middleware to allow cross-origin requests
app.use(
  cors({
    // origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
    origin: ["http://localhost:5173", "https://projects.niladribasak.in"],
    credentials: true, // allows cookies, authorization headers, etc to be passed from client
  })
);

// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://projects.niladribasak.in"],
//     methods: ["GET", "POST", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: [
//       "my-custom-header",
//       "authorization",
//       "Access-Control-Allow-Origin",
//     ],
//   })
// );

// Handle preflight requests
// app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";

// declare routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error handling middleware
app.use(errorHandler);

// export default app;
