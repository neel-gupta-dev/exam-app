import mongoose from 'mongoose';
import os from 'os';
import Session from '../models/Session.js';

/**
 * @desc    Get API health status with detailed metrics
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  // New: Gather database statistics
  let stats = {
    activeSessions: 0
  };

  try {
    if (dbStatus === 1) {
      const sessionCount = await Session.countDocuments({ expiresAt: { $gt: new Date() } });
      
      stats = {
        activeSessions: sessionCount
      };
    }
  } catch (err) {
    console.error('Error fetching health stats:', err);
  }

  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatusMap[dbStatus] || 'unknown',
        connection: dbStatus === 1 ? 'healthy' : 'unhealthy',
        stats: stats
      },
      server: {
        status: 'online',
        uptime: formatUptime(uptime),
        memoryUsage: {
          heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          rss: (memoryUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        },
        loadAverage: os.loadavg(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      }
    },
    environment: process.env.NODE_ENV || 'development'
  };

  if (dbStatus !== 1) {
    healthData.status = 'warning';
  }

  res.status(healthData.status === 'ok' ? 200 : 207).json(healthData);
};

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? `${d}d ` : "";
  const hDisplay = h > 0 ? `${h}h ` : "";
  const mDisplay = m > 0 ? `${m}m ` : "";
  const sDisplay = s > 0 ? `${s}s` : "0s";
  
  return dDisplay + hDisplay + mDisplay + sDisplay;
};

export { getHealth };
