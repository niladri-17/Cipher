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

// CORS middleware configuration
app.use(cors({
  origin: 'https://projects.niladribasak.in',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Add security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://projects.niladribasak.in');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      return res.status(200).json({});
  }
  next();
});
// app.use(
//   cors({
//     // origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
//     origin: "https://projects.niladribasak.in",
//     credentials: true, // allows cookies, authorization headers, etc to be passed from client
//   })
// );

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
