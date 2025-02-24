import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import { io, app } from "./lib/socket.js";

// cors middleware to allow cross-origin requests
const allowedOrigins = [
  "http://localhost:5173",
  "https://projects.niladribasak.in",
  "https://projects.niladribasak.in/cipher",
  "https://cipher-mern-chat-g9wrwtj5n-niladris-projects-4a9a6d43.vercel.app",
];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       // For development tools like Postman
//       if (!origin) {
//         return callback(null, true);
//       }

//       if (allowedOrigins.includes(origin)) {
//         callback(null, origin); // Important: reflect the actual origin
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(
//   cors({
//     // origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
//     origin: "https://projects.niladribasak.in",
//     credentials: true, // allows cookies, authorization headers, etc to be passed from client
//   })
// );

// CORS Middleware for Express
app.use(
  cors({
    origin: "https://projects.niladribasak.in",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Additional headers for CORS preflight
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://projects.niladribasak.in");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);

  // Handle OPTIONS method
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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
