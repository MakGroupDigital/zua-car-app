'use client';

import { useState } from 'react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { Activity, Zap, Database, Server, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const performanceData = [
  { time: '00:00', cpu: 25, memory: 45, disk: 60 },
  { time: '04:00', cpu: 18, memory: 38, disk: 62 },
  { time: '08:00', cpu: 35, memory: 52, disk: 65 },
  { time: '12:00', cpu: 45, memory: 65, disk: 68 },
  { time: '16:00', cpu: 38, memory: 58, disk: 70 },
  { time: '20:00', cpu: 28, memory: 48, disk: 72 },
  { time: '24:00', cpu: 22, memory: 42, disk: 75 },
];

const apiStatus = [
  { name: 'API Principal', status: 'healthy', uptime: 99.98, responseTime: 145 },
  { name: 'Firebase Auth', status: 'healthy', uptime: 99.95, responseTime: 230 },
  { name: 'Firestore', status: 'healthy', uptime: 99.92, responseTime: 180 },
  { name: 'Storage', status: 'healthy', uptime: 99.89, responseTime: 320 },
  { name: 'CinetPay Gateway', status: 'warning', uptime: 98.50, responseTime: 510 },
];

export default function SystemMonitoring() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Monitoring Système</h1>
          <p className="text-slate-400 mt-1">Santé et performance de l'infrastructure</p>
        </div>
        <button className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors text-sm">
          Rafraîchir
        </button>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="CPU Usage" value="32%" icon={<Activity size={24} />} color="blue" />
        <StatCard label="Memory Usage" value="52%" icon={<Database size={24} />} color="purple" />
        <StatCard label="Disk Usage" value="68%" icon={<Server size={24} />} color="amber" />
        <StatCard label="API Health" value="99.9%" icon={<Zap size={24} />} color="green" />
      </div>

      {/* Performance Chart */}
      <ChartContainer title="Performance 24 heures">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
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
            <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
            <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} name="Memory %" />
            <Line type="monotone" dataKey="disk" stroke="#f59e0b" strokeWidth={2} name="Disk %" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* API Services Status */}
      <ChartContainer title="État des Services API">
        <div className="space-y-3">
          {apiStatus.map((service) => (
            <div
              key={service.name}
              className={`p-4 rounded-lg border ${
                service.status === 'healthy'
                  ? 'bg-green-500/5 border-green-500/20'
                  : service.status === 'warning'
                  ? 'bg-amber-500/5 border-amber-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {service.status === 'healthy' ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : service.status === 'warning' ? (
                    <AlertCircle size={20} className="text-amber-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400" />
                  )}
                  <p className="font-semibold text-white">{service.name}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.status === 'healthy'
                      ? 'bg-green-500/20 text-green-400'
                      : service.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {service.status === 'healthy' ? 'Sain' : service.status === 'warning' ? 'Avertissement' : 'Critique'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Uptime</p>
                  <p className="text-white font-medium">{service.uptime}%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs mb-1">Temps de Réponse</p>
                  <p className="text-white font-medium">{service.responseTime}ms</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      {/* System Alerts */}
      <ChartContainer title="Alertes Système">
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-white">Utilisation Disque Élevée</p>
                <p className="text-sm text-slate-400 mt-1">L'utilisation du disque a atteint 75%. Envisagez de nettoyer les données obsolètes.</p>
                <p className="text-xs text-slate-500 mt-2">Il y a 2 heures</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-white">Lenteur du Paiement</p>
                <p className="text-sm text-slate-400 mt-1">Le service CinetPay répond avec un délai de 510ms (normal: &lt;200ms).</p>
                <p className="text-xs text-slate-500 mt-2">Il y a 30 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </ChartContainer>

      {/* Database Status */}
      <ChartContainer title="État de la Base de Données">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Collections Firestore</p>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-slate-400 mt-2">2.4 GB utilisés</p>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Fichiers Stockage</p>
            <p className="text-2xl font-bold text-white">5,234</p>
            <p className="text-xs text-slate-400 mt-2">45.8 GB utilisés</p>
          </div>
          <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-500 mb-2">Requêtes/Jour</p>
            <p className="text-2xl font-bold text-white">2.3M</p>
            <p className="text-xs text-slate-400 mt-2">Quota: 10M</p>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
}
