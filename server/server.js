import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "YOUR_MONGO_URI";
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("Mongo error ❌:", err.message));

// 🧠 Single flexible schema
const dataSchema = new mongoose.Schema({
  data: Object,
});

const Data = mongoose.model("Data", dataSchema);

// 🟡 SEED DATA
// app.post("/seed", async (req, res) => {
//   try {
//     await Data.deleteMany(); // optional: clears old data

//     const doc = await Data.create({ data: req.body });

//     res.json({ success: true, doc });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Seeding failed" });
//   }
// });

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
  console.log("Server running on port 5000");
});
