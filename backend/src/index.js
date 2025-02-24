import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import "./app.js";
import { io, server } from "./lib/socket.js";

dotenv.config({
  path: "./.env",
});


connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
