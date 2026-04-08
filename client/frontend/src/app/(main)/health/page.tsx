'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Cpu, 
  HardDrive,
  ExternalLink,
  ChevronLeft,
  StickyNote
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/env';

interface HealthData {
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      connection: string;
      stats: {
        activeSessions: number;
      };
    };
    server: {
      status: string;
      uptime: string;
      memoryUsage: {
        heapTotal: string;
        heapUsed: string;
        rss: string;
      };
      loadAverage: number[];
      platform: string;
      nodeVersion: string;
      pid: number;
    };
  };
  environment: string;
}

/**
 * API Health Dashboard
 * An admin/diagnostic interface to monitor the Express backend and MongoDB status.
 * Implements real-time polling to calculate API latency and server load.
 */
export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latency, setLatency] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Health Fetcher & Latency Calculator
   * Wraps the API call in a performance timer to continuously measure
   * and store frontend-to-backend ping latency.
   */
  const fetchHealth = useCallback(async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      // Use API_BASE_URL from env — with hardcoded fallback for stale builds.
      const apiUrl = API_BASE_URL || 'https://api.vayl.in';
      const response = await fetch(`${apiUrl}/health`, { mode: 'cors' });
      const end = performance.now();
      const currentLatency = Math.round(end - start);
      setLatency(prev => [...prev.slice(-9), currentLatency]);

      if (!response.ok && response.status !== 207) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API health');
      console.error('Health fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Faster refresh for latency
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const StatusBadge = ({ status, pulse }: { status: string, pulse?: boolean }) => {
    const isOk = status === 'ok' || status === 'connected' || status === 'online' || status === 'healthy';
    const isWarning = status === 'warning' || status === 'connecting';
    
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition-all ${
        isOk ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
        isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}>
        {isOk ? <CheckCircle2 size={10} className={pulse ? 'animate-pulse' : ''} /> : <AlertCircle size={10} />}
        {status.toUpperCase()}
      </span>
    );
  };

  const MetricCard = ({ icon: Icon, title, value, subValue, color = "primary" }: { icon: any, title: string, value: string | number, subValue?: string, color?: string }) => (
    <div className="glass-card p-4 rounded-2xl flex flex-col gap-2 group hover:border-primary/30 transition-all">
      <div className="flex items-center gap-2 text-on-surface-variant">
        <Icon size={14} className={`text-${color}`} />
        <span className="text-xs font-semibold uppercase tracking-tight opacity-70">{title}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-on-surface">{value}</span>
        {subValue && <span className="text-[10px] font-medium text-on-surface-variant/70 uppercase">{subValue}</span>}
      </div>
    </div>
  );

  const StatBox = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
    <div className="flex items-center gap-4 p-4 glass-card rounded-2xl flex-1 hover:bg-surface-bright/50 transition-colors">
      <div className="p-3 bg-surface-variant/40 text-primary rounded-xl group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-on-surface-variant font-medium">{label}</span>
        <span className="text-2xl font-black font-[family-name:var(--font-headline)]">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 text-on-surface relative overflow-hidden font-[family-name:var(--font-body)]">
      {/* Background Decor */}
      <div className="orb w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
      <div className="orb w-[400px] h-[400px] bg-tertiary/10 bottom-0 -right-24" />
      <div className="mesh-grid absolute inset-0 opacity-30 pointer-events-none" />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest group">
              <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="space-y-1">
              <h1 className="text-4xl lg:text-6xl font-black font-[family-name:var(--font-headline)] tracking-tighter uppercase">
                Console <span className="text-primary italic">Metrics</span>
              </h1>
              <p className="text-on-surface-variant max-w-md text-sm">
                Advanced diagnostic dashboard for infrastructure and application state.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Last ping</p>
              <p className="text-sm font-mono font-bold text-primary">{mounted ? lastUpdated.toLocaleTimeString() : '--:--:--'}</p>
            </div>
            <button 
              onClick={fetchHealth}
              disabled={isRefreshing}
              className="glass-card w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-surface-bright transition-all active:scale-90 disabled:opacity-50 group border-primary/20"
            >
              <RefreshCw size={20} className={`${isRefreshing ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        {error ? (
          <div className="glass-card p-12 rounded-[2.5rem] border-rose-500/20 text-center space-y-6">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-400 rounded-3xl flex items-center justify-center mx-auto rotate-3">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Backend Unreachable</h2>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto">{error}</p>
            </div>
            <button 
              onClick={fetchHealth}
              className="bg-primary text-on-primary px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Initialize Reconnect
            </button>
          </div>
        ) : loading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-80 glass-card rounded-[2rem] bg-surface-variant/30" />
            <div className="h-80 glass-card rounded-[2rem] bg-surface-variant/30" />
            <div className="h-80 glass-card rounded-[2rem] bg-surface-variant/30" />
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-4 glass-card rounded-2xl flex-1 border-primary/20 bg-primary/5">
                <div className="p-3 bg-primary text-on-primary rounded-xl relative">
                  <Activity size={20} className="animate-heart-beat" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-primary font-bold uppercase tracking-wider">Active Sessions</span>
                  <span className="text-2xl font-black">{data.services.database.stats.activeSessions}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Database Overview */}
              <div className="lg:col-span-1 glass-card p-8 rounded-[2rem] space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                       <Database size={20} className="text-primary" /> Database
                    </h3>
                    <StatusBadge status={data.services.database.status} pulse />
                  </div>
                  <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Cluster Provider</span>
                      <span className="font-bold text-primary">AWS / MongoDB Atlas</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">Connection Type</span>
                      <span className="font-bold uppercase tracking-widest text-[10px]">Pooled / SSL</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">API Latency (Ping)</p>
                  <div className="flex items-end gap-1 h-12">
                    {latency.map((l, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-t-sm transition-all duration-500 ${l < 100 ? 'bg-emerald-500/40' : l < 300 ? 'bg-amber-500/40' : 'bg-rose-500/40'}`}
                        style={{ height: `${Math.min(100, (l / 500) * 100)}%` }}
                        title={`${l}ms`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-right text-on-surface-variant opacity-60 italic">Real-time frontend to API ping</p>
                </div>
              </div>

              {/* Server Details */}
              <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                       <Server size={20} className="text-tertiary" /> Infrastructure
                    </h3>
                    <StatusBadge status={data.services.server.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard icon={Clock} title="Uptime" value={data.services.server.uptime} color="emerald-400" />
                    <MetricCard icon={Cpu} title="Node" value={data.services.server.nodeVersion} subValue={`PID: ${data.services.server.pid}`} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <HardDrive size={20} className="text-amber-400" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Resource Utilization</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard icon={Activity} title="Heap Used" value={data.services.server.memoryUsage.heapUsed} subValue={`Limit: ${data.services.server.memoryUsage.heapTotal}`} />
                    <MetricCard icon={Cpu} title="System Load" value={data.services.server.loadAverage[0].toFixed(2)} subValue="1m AVG" />
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Banner */}
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between bg-surface-variant/20 border-primary/10">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary text-on-primary rounded-md">
                  {data.environment}
                </span>
                <span className="text-xs font-medium text-on-surface-variant italic">
                  Instance running on {data.services.server.platform} v1.2.0-stable
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono opacity-50">
                <span>{data.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
