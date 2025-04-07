import mongoose from "mongoose";

let cache = global.mongoose || {};

if (!cache.conn) {
  cache = global.mongoose = { conn: null, promise: null };
}

async function ConnectDB() {
  if (cache.conn) {
    console.log("Using cached MongoDB connection");
    return cache.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log(
      "Connecting to MongoDB with URI:",
      process.env.MONGO_URI.replace(/:([^:@]+)@/, ":****@")
    ); // Mask password
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log(
          "MongoDB connected to:",
          mongoose.connection.db.databaseName
        );
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error);
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default ConnectDB;
