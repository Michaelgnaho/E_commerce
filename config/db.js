import mogoose from "mongoose";

let cache = global.moogose;

if (!cache) {
  cache = global.moogose = { conn: null, promise: null };
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
