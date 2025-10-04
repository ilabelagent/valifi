/**
 * REAL-TIME KINGDOM DASHBOARD
 * Live monitoring of all 60+ bots, security, predictions, and system health
 */

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface BotMetrics {
  total: number;
  active: number;
  categories: Record<string, string[]>;
}

interface SystemMetrics {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  nodeVersion: string;
}

interface SecurityMetrics {
  threatsDetected: number;
  status: string;
}

interface DashboardMetrics {
  bots: BotMetrics;
  system: SystemMetrics;
  security: SecurityMetrics;
  predictions: {
    count: number;
    lastUpdate: string;
  };
}

const KingdomDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  useEffect(() => {
    const SOCKET_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : `http://${window.location.hostname}:3001`;

    const newSocket = io(SOCKET_URL);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to Kingdom Standard');
      setConnected(true);
      newSocket.emit('subscribe_updates');
    });

    newSocket.on('welcome', (data) => {
      console.log('👑 Kingdom Welcome:', data);
    });

    newSocket.on('system_metrics', (data) => {
      setLiveUpdates(prev => [data, ...prev].slice(0, 10));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Kingdom Standard');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/kingdom/dashboard');
        const data = await response.json();
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Kingdom Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                👑 Kingdom Standard Dashboard
              </h1>
              <p className="text-gray-300">
                Real-time monitoring of {metrics.bots.total} intelligent bots
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-white">{connected ? 'Live' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bots */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
            <div className="text-gray-400 text-sm mb-2">Total Bots</div>
            <div className="text-4xl font-bold text-white">{metrics.bots.total}</div>
            <div className="text-green-400 text-sm mt-2">
              ✅ {metrics.bots.active} Active
            </div>
          </div>

          {/* System Uptime */}
          <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
            <div className="text-gray-400 text-sm mb-2">System Uptime</div>
            <div className="text-3xl font-bold text-white">
              {formatUptime(metrics.system.uptime)}
            </div>
            <div className="text-blue-400 text-sm mt-2">
              Node {metrics.system.nodeVersion}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
            <div className="text-gray-400 text-sm mb-2">Security Status</div>
            <div className="text-2xl font-bold text-green-400 uppercase">
              {metrics.security.status}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              🛡️ Threats: {metrics.security.threatsDetected}
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gray-800 rounded-lg p-6 border border-orange-500">
            <div className="text-gray-400 text-sm mb-2">Memory Usage</div>
            <div className="text-2xl font-bold text-white">
              {formatBytes(metrics.system.memory.heapUsed)}
            </div>
            <div className="text-gray-400 text-sm mt-2">
              of {formatBytes(metrics.system.memory.heapTotal)}
            </div>
          </div>
        </div>

        {/* Bot Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Divine Bots */}
          <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              ✝️ Divine Components
            </h3>
            <div className="space-y-2">
              {metrics.bots.categories.divine?.map((bot: string) => (
                <div key={bot} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <span className="text-white">{bot}</span>
                  <span className="text-green-400 text-sm">✓ Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Bots */}
          <div className="bg-gray-800 rounded-lg p-6 border border-green-500">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              🛡️ Security & Defense
            </h3>
            <div className="space-y-2">
              {metrics.bots.categories.security?.map((bot: string) => (
                <div key={bot} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <span className="text-white">{bot}</span>
                  <span className="text-green-400 text-sm">✓ Active</span>
                </div>
              ))}
              {metrics.bots.categories.cyberdefense?.map((bot: string) => (
                <div key={bot} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <span className="text-white">{bot}</span>
                  <span className="text-green-400 text-sm">✓ Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Updates */}
        <div className="bg-gray-800 rounded-lg p-6 border border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            📡 Live System Updates
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {liveUpdates.map((update, index) => (
              <div key={index} className="p-3 bg-gray-700 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-blue-400">
                    {update.bots} bots • {formatBytes(update.memory?.heapUsed || 0)} memory
                  </span>
                </div>
              </div>
            ))}
            {liveUpdates.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                Waiting for live updates...
              </div>
            )}
          </div>
        </div>

        {/* All Categories Overview */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-600">
          <h3 className="text-xl font-bold text-white mb-4">📊 Complete Bot Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics.bots.categories).map(([category, bots]) => (
              <div key={category} className="text-center p-4 bg-gray-700 rounded">
                <div className="text-2xl font-bold text-purple-400">{bots.length}</div>
                <div className="text-gray-300 text-sm mt-1 capitalize">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KingdomDashboard;
