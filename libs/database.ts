
import mongoose from "mongoose";
import type { MongooseCache } from "@/types/global-cache.type";

const MONGODB_URI:any = process.env.MONGODB_URI || null;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached = (global.mongoose ??= {
  conn: null,
  promise: null,
});

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log("MongoDB: Already connected");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("MongoDB: Connecting...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("MongoDB connected:", mongoose.connection.name);

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
