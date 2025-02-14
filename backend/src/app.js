import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

// declare routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
