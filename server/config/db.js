import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

// const MONGO_URL = process.env.MONGO_URL;
const MONGO_URL = process.env.MONGO_URL;

console.log("MONGO_URL:", MONGO_URL); // Debug log to check the value

if (!MONGO_URL) {
  console.error("❌ MONGO_URL is missing in .env");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected ✅");
  } catch (err) {
    console.log("Mongo error ❌:", err.message);
    process.exit(1);
  }
};

// ✅ Attach listeners ONCE (outside function)
mongoose.connection.on("connected", () => {
  console.log("Mongo connected");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongo error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongo disconnected ⚠️");
});

export default connectDB;