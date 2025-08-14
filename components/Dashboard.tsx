import React, { useState, useEffect } from 'react';
import { getDashboardStats, getIngestRequests } from '../services/api';
import { Card } from './common/Card';
import { Spinner } from './common/Spinner';
import { IngestIcon, DispatchIcon, AlertTriangleIcon, WebhookIcon, ClockIcon } from './icons';
import { RawRequest } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ totalIngest: number; totalDispatch: number; failedDispatch: number; activeWebhooks: number; avgExecutionTime: number } | null>(null);
  const [requests, setRequests] = useState<RawRequest[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, requestsData] = await Promise.all([
            getDashboardStats(),
            getIngestRequests()
        ]);
        setStats(statsData);
        setRequests(requestsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartData = () => {
    if (!requests) return [];
    const hourlyData: { [key: string]: { requests: number } } = {};
    const now = new Date();

    for (let i = 0; i < 24; i++) {
        const hour = new Date(now);
        hour.setHours(now.getHours() - i);
        const hourString = hour.getHours().toString().padStart(2, '0') + ':00';
        hourlyData[hourString] = { requests: 0 };
    }

    requests.forEach(log => {
      const logDate = new Date(log.timestamp);
      if ((now.getTime() - logDate.getTime()) < 24 * 60 * 60 * 1000) {
        const hourString = logDate.getHours().toString().padStart(2, '0') + ':00';
        if (hourlyData[hourString]) {
          hourlyData[hourString].requests++;
        }
      }
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({ name: hour, ...data })).reverse();
  };


  if (loading) {
    return <div className="h-full flex items-center justify-center"><Spinner /></div>;
  }

  if (!stats) {
    return <p>Failed to load dashboard data.</p>;
  }
  
  const chartData = getChartData();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card title="Ingest Requests" value={stats.totalIngest} icon={<IngestIcon className="w-6 h-6 text-cyan-400" />} description="All-time ingested requests" />
        <Card title="Dispatch Requests" value={stats.totalDispatch} icon={<DispatchIcon className="w-6 h-6 text-purple-400" />} description="All-time dispatched requests" />
        <Card title="Failed Dispatches" value={stats.failedDispatch} icon={<AlertTriangleIcon className="w-6 h-6 text-red-400" />} description="All-time failed dispatches" />
        <Card title="Avg. Dispatch Time" value={`${stats.avgExecutionTime}ms`} icon={<ClockIcon className="w-6 h-6 text-yellow-400" />} description="Avg. dispatch processing time" />
        <Card title="Active Webhooks" value={stats.activeWebhooks} icon={<WebhookIcon className="w-6 h-6 text-green-400" />} description="Currently enabled webhooks" />
      </div>

      <div className="mt-8 bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">Ingest Requests in Last 24 Hours</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                color: '#e2e8f0'
              }}
              cursor={{ fill: '#33415580' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="requests" fill="#06b6d4" name="Ingest Requests" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};