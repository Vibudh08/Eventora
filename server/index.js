import dns from "node:dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./dbConnect.js";
import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";
import eventRoutes from "./routes/events.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
dbConnection();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/booking", bookingRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
