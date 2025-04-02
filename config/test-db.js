// testConnection.js
import "dotenv/config";
import connectDB from "./db.js";
import User from "../models/User.js";

async function testConnection() {
  try {
    await connectDB();
    console.log("Connected to database");

    const testUser = await User.create({
      _id: "test-id-123",
      name: "Test User",
      email: "test@example.com",
      imgUrl: "https://example.com/img.jpg",
    });
    console.log("Test user created:", testUser);
  } catch (error) {
    console.error("Database operation failed:", error);
  } finally {
    // Close the connection when testing
    process.exit(0);
  }
}

testConnection();
