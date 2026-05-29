import mongoose from 'mongoose';
import { MONGO_URI, ANALYTICS_MONGO_URI } from './index.js';

const connectionOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000, // Increased to 10s for slower local startups
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
};

const getDatabaseName = (uri) => {
  try {
    const parsed = new URL(uri);
    return parsed.pathname?.replace(/^\//, '') || 'default';
  } catch {
    return 'unknown';
  }
};

const redactMongoUri = (uri) => {
  try {
    const parsed = new URL(uri);
    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return String(uri).replace(/\/\/([^:@/]+):([^@/]+)@/, '//***:***@');
  }
};

const getLocalUriCandidates = (uri) => {
  const candidates = [uri];
  const replacements = [
    ['//127.0.0.1', '//localhost'],
    ['//localhost', '//127.0.0.1'],
    ['//[::1]', '//localhost'],
  ];

  for (const [from, to] of replacements) {
    if (uri.includes(from)) {
      const candidate = uri.replace(from, to);
      if (!candidates.includes(candidate)) candidates.push(candidate);
    }
  }

  return candidates;
};

const openConnection = async (connection, uri, label) => {
  if (connection.readyState === 1) return;
  if (connection.readyState === 2) {
    await connection.asPromise();
    return;
  }

  let lastError;
  const candidates = getLocalUriCandidates(uri);

  for (const candidate of candidates) {
    try {
      console.log(`[DB] Connecting ${label} DB (${getDatabaseName(candidate)}) via ${redactMongoUri(candidate)}`);
      await connection.openUri(candidate, connectionOptions);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`[DB] ${label} DB connection failed for ${redactMongoUri(candidate)}: ${err.message}`);
      await connection.close().catch(() => {});
    }
  }

  throw lastError;
};

// Isolated connections. Models register against these immediately, but sockets
// are opened explicitly by waitForConnections() during server startup.
export const coreConnection = mongoose.connection;

export const analyticsConnection = mongoose.createConnection();

// Logging
coreConnection.on('connected', () => console.log(`[DB] Core DB Connected (${coreConnection.name})`));
coreConnection.on('error', (err) => console.error('[DB] Core DB Error:', err));

analyticsConnection.on('connected', () => console.log(`[DB] Analytics DB Connected (${analyticsConnection.name})`));
analyticsConnection.on('error', (err) => console.error('[DB] Analytics DB Error:', err));

let connectionPromise = null;

/**
 * Ensures both connections are fully established before proceeding.
 * Uses Mongoose's native asPromise() to safely await the connection pool.
 */
export const waitForConnections = async () => {
  if (coreConnection.readyState === 1 && analyticsConnection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = Promise.all([
      openConnection(coreConnection, MONGO_URI, 'Core'),
      openConnection(analyticsConnection, ANALYTICS_MONGO_URI, 'Analytics'),
    ]);
  }

  try {
    await connectionPromise;
    console.log('[DB] Both connections fully established.');
  } catch (err) {
    connectionPromise = null;
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
