import mongoose from 'mongoose';
import { MONGO_URI, ANALYTICS_MONGO_URI } from './index.js';

const connectionOptions = {
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
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
 */
export const waitForConnections = () => {
  const wait = (conn, label) => {
    if (conn.readyState === 1) return Promise.resolve();
    return new Promise((resolve, reject) => {
      conn.once('connected', () => {
        console.log(`[DB] ${label} resolved connection.`);
        resolve();
      });
      conn.once('error', (err) => {
        console.error(`[DB] ${label} failed to connect.`);
        reject(err);
      });
    });
  };

  return Promise.all([
    wait(coreConnection, 'CORE'),
    wait(analyticsConnection, 'ANALYTICS')
  ]);
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
