import mongoose from 'mongoose';
import { MONGO_URI } from './index.js';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  if (mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Serverless Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
