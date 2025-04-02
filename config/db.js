import mongoose from "mongoose";

let cache = global.mongoose || {};

if (!cache.conn) {
  cache = global.mongoose = { conn: null, promise: null };
}

async function ConnectDB() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = {
      bufferCommands: false,
    };

    cache.promise = mogoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export default ConnectDB;
