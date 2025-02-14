import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

dotenv.config({
  path: "./.env",
});


// Debug environment variables
// console.log("Environment Check:", {
//   PORT: process.env.PORT ? "configured" : "missing",
//   CORS_ORIGIN: process.env.CORS_ORIGIN ? "configured" : "missing",
//   CLOUDINARY_CONFIG: {
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "configured" : "missing",
//     api_key: process.env.CLOUDINARY_API_KEY ? "configured" : "missing",
//     api_secret: process.env.CLOUDINARY_API_SECRET ? "configured" : "missing",
//   },
// });

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        `⚙️  Server is running at port : ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
