import mongoose from 'mongoose';
import { MONGO_URI } from './index.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error; // Rethrow to let the caller handle it or log it
  }
};

export default connectDB;
