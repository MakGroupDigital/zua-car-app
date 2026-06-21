'use client';

import { useState } from 'react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Activity, Eye, Download } from 'lucide-react';

const userBehaviorData = [
  { date: '01', searches: 120, views: 340, favorites: 45, purchases: 12 },
  { date: '02', searches: 150, views: 390, favorites: 52, purchases: 15 },
  { date: '03', searches: 130, views: 360, favorites: 48, purchases: 14 },
  { date: '04', searches: 200, views: 480, favorites: 65, purchases: 22 },
  { date: '05', searches: 180, views: 450, favorites: 58, purchases: 18 },
  { date: '06', searches: 220, views: 520, favorites: 72, purchases: 25 },
  { date: '07', searches: 250, views: 600, favorites: 85, purchases: 30 },
];

const conversionData = [
  { sessions: 100, conversions: 12 },
  { sessions: 150, conversions: 18 },
  { sessions: 200, conversions: 28 },
  { sessions: 250, conversions: 35 },
  { sessions: 300, conversions: 42 },
  { sessions: 350, conversions: 50 },
  { sessions: 400, conversions: 58 },
  { sessions: 450, conversions: 65 },
];

const topSearches = [
  { keyword: 'Toyota', count: 450 },
  { keyword: 'BMW', count: 380 },
  { keyword: 'Mercedes', count: 290 },
  { keyword: 'Audi', count: 260 },
  { keyword: 'Honda', count: 210 },
];

const topCategories = [
  { category: 'Voitures', views: 2450, percentage: 45 },
  { category: 'Motos', views: 1200, percentage: 22 },
  { category: 'Pièces', views: 980, percentage: 18 },
  { category: 'Services', views: 550, percentage: 10 },
];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7days');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Comportement</h1>
          <p className="text-slate-400 mt-1">Analyse détaillée du comportement des utilisateurs</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {range === '24h' ? '24h' : range === '7days' ? '7 jours' : range === '30days' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Recherches Totales"
          value="1350"
          change={15.2}
          icon={<Activity size={24} />}
          color="blue"
        />
        <StatCard
          label="Vues de Listings"
          value="3140"
          change={12.8}
          icon={<Eye size={24} />}
          color="purple"
        />
        <StatCard
          label="Taux de Conversion"
          value="7.4%"
          change={2.3}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          label="Session Moyenne"
          value="4m 32s"
          change={-1.5}
          icon={<Users size={24} />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <ChartContainer title="Activité Utilisateurs (7 jours)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userBehaviorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="searches" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Conversion Analysis */}
        <ChartContainer title="Analyse de Conversion">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="sessions" stroke="#94a3b8" name="Sessions" />
              <YAxis stroke="#94a3b8" name="Conversions" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter name="Conversion Rate" data={conversionData} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <ChartContainer title="Top Recherches">
          <div className="space-y-3">
            {topSearches.map((search, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="font-medium text-white">{search.keyword}</p>
                </div>
                <span className="text-slate-400">{search.count} recherches</span>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Top Categories */}
        <ChartContainer title="Catégories Populaires">
          <div className="space-y-3">
            {topCategories.map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{cat.category}</p>
                  <span className="text-sm text-slate-400">{cat.views} vues ({cat.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* User Segments */}
      <ChartContainer title="Segments Utilisateurs" action={<button className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"><Download size={16} /> Export</button>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Nouveaux Utilisateurs</p>
            <p className="text-2xl font-bold text-white">342</p>
            <p className="text-xs text-green-400 mt-2">+8.5% depuis hier</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold text-white">1892</p>
            <p className="text-xs text-green-400 mt-2">+12.3% depuis hier</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Taux d'Engagement</p>
            <p className="text-2xl font-bold text-white">62.4%</p>
            <p className="text-xs text-green-400 mt-2">+5.1% depuis hier</p>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
}
