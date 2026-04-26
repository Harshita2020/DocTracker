import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

dotenv.config();

// ✅ Connect DB ONCE
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Schema
const dataSchema = new mongoose.Schema({
  data: Object,
});

const Data = mongoose.model("Data", dataSchema);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🟢 GET DATA
app.get("/data", async (req, res) => {
  const doc = await Data.findOne();
  res.json(doc ? doc.data : {});
});

// 🔵 SAVE DATA
app.post("/data", async (req, res) => {
  let doc = await Data.findOne();

  if (doc) {
    doc.data = req.body;
    await doc.save();
  } else {
    await Data.create({ data: req.body });
  }

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});