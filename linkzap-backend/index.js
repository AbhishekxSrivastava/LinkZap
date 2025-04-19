import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import urlRoutes from "./routes/urlRoutes.js";

dotenv.config();

const app = express();
connectDB();

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

app.get("/", (req, res) => {
  res.send("LinkZap is Connected Successfully!!!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server Started at Port http://localhost:5000");
});
