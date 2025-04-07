import ConnectDB from "./config/db.js";
import User from "./models/User.js";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function testConnection() {
  try {
    await ConnectDB();
    const testUser = await User.create({
      _id: "test123",
      name: "Test User",
      email: "test@example.com",
      imgUrl: "https://example.com/test.jpg",
    });
    console.log("Test user created:", testUser);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    process.exit();
  }
}

testConnection();
