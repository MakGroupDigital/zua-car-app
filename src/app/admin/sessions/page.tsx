'use client';

import { useState } from 'react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { Globe, Activity, MapPin, User } from 'lucide-react';

const MOCK_SESSIONS = [
  {
    id: '1',
    userId: 'user_1',
    userName: 'Ahmed Mohammed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    loginTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    lastActivityTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    ipAddress: '192.168.1.100',
    location: { country: 'Morocco', city: 'Casablanca' },
    deviceInfo: { browser: 'Chrome', os: 'Windows 10', device: 'Desktop' },
    isActive: true,
    currentPage: '/app/home',
  },
  {
    id: '2',
    userId: 'user_2',
    userName: 'Fatima Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    loginTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    lastActivityTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    ipAddress: '192.168.1.101',
    location: { country: 'Morocco', city: 'Rabat' },
    deviceInfo: { browser: 'Safari', os: 'iOS', device: 'iPhone' },
    isActive: true,
    currentPage: '/app/listings/123',
  },
  {
    id: '3',
    userId: 'user_3',
    userName: 'Mohamed Ali',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
    loginTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    lastActivityTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    ipAddress: '192.168.1.102',
    location: { country: 'Morocco', city: 'Fez' },
    deviceInfo: { browser: 'Chrome', os: 'Android', device: 'Mobile' },
    isActive: false,
    currentPage: '/app/favorites',
  },
  {
    id: '4',
    userId: 'user_4',
    userName: 'Aisha Khalid',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
    loginTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    lastActivityTime: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
    ipAddress: '192.168.1.103',
    location: { country: 'Morocco', city: 'Marrakech' },
    deviceInfo: { browser: 'Firefox', os: 'Mac OS', device: 'Desktop' },
    isActive: true,
    currentPage: '/app/dashboard',
  },
  {
    id: '5',
    userId: 'user_5',
    userName: 'Hassan Ibrahim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan',
    loginTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    lastActivityTime: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    ipAddress: '192.168.1.104',
    location: { country: 'Morocco', city: 'Tangier' },
    deviceInfo: { browser: 'Chrome', os: 'Windows 11', device: 'Desktop' },
    isActive: true,
    currentPage: '/app/messages',
  },
];

const getTimeDiff = (date: Date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
};

export default function SessionsMonitoring() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [sortBy, setSortBy] = useState<'recent' | 'location' | 'device'>('recent');

  const activeSessions = sessions.filter((s) => s.isActive).length;
  const totalSessions = sessions.length;

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.lastActivityTime.getTime() - a.lastActivityTime.getTime();
    }
    if (sortBy === 'location') {
      return a.location.city.localeCompare(b.location.city);
    }
    return a.deviceInfo.device.localeCompare(b.deviceInfo.device);
  });

  const getSessionDuration = (loginTime: Date) => {
    const diff = Math.floor((Date.now() - loginTime.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Utilisateurs En Ligne</h1>
        <p className="text-slate-400 mt-1">Surveillance en temps réel des sessions actives</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Utilisateurs Actifs"
          value={activeSessions}
          icon={<Activity size={24} />}
          color="green"
        />
        <StatCard
          label="Total Connectés"
          value={totalSessions}
          icon={<Globe size={24} />}
          color="blue"
        />
        <StatCard
          label="Taux d'Activité"
          value={`${Math.round((activeSessions / totalSessions) * 100)}%`}
          icon={<User size={24} />}
          color="amber"
        />
      </div>

      {/* Filters */}
      <ChartContainer title="Options de Tri">
        <div className="flex gap-2 flex-wrap">
          {['recent', 'location', 'device'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option as 'recent' | 'location' | 'device')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sortBy === option
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {option === 'recent' ? 'Plus Récent' : option === 'location' ? 'Par Localisation' : 'Par Appareil'}
            </button>
          ))}
        </div>
      </ChartContainer>

      {/* Sessions List */}
      <ChartContainer title={`Sessions Actives (${activeSessions}/${totalSessions})`}>
        <div className="space-y-4">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border transition-all ${
                session.isActive
                  ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/50'
                  : 'bg-slate-800/20 border-slate-700/30 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-4 mb-3">
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <img src={session.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">{session.userName}</p>
                    <p className="text-xs text-slate-400">Session #{session.id}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${session.isActive ? 'bg-green-500' : 'bg-slate-500'} animate-pulse`} />
                  <span className={`text-xs font-medium ${session.isActive ? 'text-green-400' : 'text-slate-400'}`}>
                    {session.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-slate-800/30 rounded">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Durée</p>
                  <p className="text-sm font-medium text-white">{getSessionDuration(session.loginTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Dernière Activité</p>
                  <p className="text-sm font-medium text-white">{getTimeDiff(session.lastActivityTime)} ago</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Localisation</p>
                  <p className="text-sm font-medium text-white flex items-center gap-1">
                    <MapPin size={12} /> {session.location.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Appareil</p>
                  <p className="text-sm font-medium text-white">{session.deviceInfo.device}</p>
                </div>
              </div>

              {/* IP & Browser */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">IP Address</p>
                  <p className="text-slate-300">{session.ipAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Navigateur</p>
                  <p className="text-slate-300">{session.deviceInfo.browser} on {session.deviceInfo.os}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500">Page Actuelle</p>
                  <p className="text-slate-300 font-mono text-xs">{session.currentPage}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition-colors text-sm">
                  Voir l'Activité
                </button>
                <button className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors text-sm">
                  Déconnecter
                </button>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
