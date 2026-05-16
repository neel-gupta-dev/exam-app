import mongoose from 'mongoose';
import { MONGO_URI, ANALYTICS_MONGO_URI } from './index.js';

const connectionOptions = {
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000, // Increased to 10s for slower local startups
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  family: 4, // Enforce IPv4, avoids IPv6 localhost timeouts in Node 17+
};

// 1. Establish isolated connections
export const coreConnection = mongoose.createConnection(MONGO_URI, connectionOptions);
export const analyticsConnection = mongoose.createConnection(ANALYTICS_MONGO_URI, connectionOptions);

// Logging
coreConnection.on('connected', () => console.log('[DB] Core DB Connected (vayl_core)'));
coreConnection.on('error', (err) => console.error('[DB] Core DB Error:', err));

analyticsConnection.on('connected', () => console.log('[DB] Analytics DB Connected (vayl_analytics)'));
analyticsConnection.on('error', (err) => console.error('[DB] Analytics DB Error:', err));

/**
 * Ensures both connections are fully established before proceeding.
 * Uses Mongoose's native asPromise() to safely await the connection pool.
 */
export const waitForConnections = async () => {
  try {
    await Promise.all([
      coreConnection.asPromise(),
      analyticsConnection.asPromise()
    ]);
    console.log('[DB] Both connections fully established.');
  } catch (err) {
    console.error('[DB] Failed to establish connections:', err);
    throw err;
  }
};

/**
 * Closes all database connections gracefully.
 */
export const closeConnections = async () => {
  console.log('[DB] Closing all connections...');
  try {
    await Promise.all([
      coreConnection.close(),
      analyticsConnection.close(),
    ]);
    console.log('[DB] All connections closed.');
  } catch (error) {
    console.error('[DB] Error during connection closure:', error);
  }
};

// Legacy support (to be removed once all models are migrated)
export default waitForConnections;
