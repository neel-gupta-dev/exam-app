import mongoose from 'mongoose';
import { MONGO_URI } from './index.js';

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // If a connection attempt is already in-flight, reuse it
  // (prevents duplicate connections during concurrent cold-start requests)
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  }).then((conn) => {
    console.log(`MongoDB Serverless Connected: ${conn.connection.host}`);
    return conn;
  }).catch((error) => {
    console.error(`MongoDB connection error: ${error.message}`);
    connectionPromise = null; // Allow retry on next request
    throw error;
  });

  return connectionPromise;
};

export default connectDB;
