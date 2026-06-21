'use client';

import { useEffect, useState } from 'react';
import { StatCard, ChartContainer, ListItem } from './components/stat-card';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  AlertCircle,
  CreditCard,
  Activity,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock Data
const revenueData = [
  { date: '01 Jan', revenue: 2400, commission: 1200 },
  { date: '02 Jan', revenue: 3200, commission: 1600 },
  { date: '03 Jan', revenue: 2800, commission: 1400 },
  { date: '04 Jan', revenue: 3900, commission: 1950 },
  { date: '05 Jan', revenue: 4200, commission: 2100 },
  { date: '06 Jan', revenue: 3800, commission: 1900 },
  { date: '07 Jan', revenue: 4500, commission: 2250 },
];

const usersData = [
  { date: '01 Jan', activeUsers: 1200, newUsers: 120 },
  { date: '02 Jan', activeUsers: 1400, newUsers: 150 },
  { date: '03 Jan', activeUsers: 1300, newUsers: 130 },
  { date: '04 Jan', activeUsers: 1800, newUsers: 200 },
  { date: '05 Jan', activeUsers: 2100, newUsers: 250 },
  { date: '06 Jan', activeUsers: 1900, newUsers: 180 },
  { date: '07 Jan', activeUsers: 2300, newUsers: 280 },
];

const listingTypeData = [
  { name: 'Vente', value: 45, fill: '#f59e0b' },
  { name: 'Location', value: 30, fill: '#3b82f6' },
  { name: 'Pièces', value: 15, fill: '#10b981' },
  { name: 'Services', value: 10, fill: '#8b5cf6' },
];

const recentReports = [
  {
    id: '1',
    title: 'Arnaque détectée',
    description: 'User #123 - Activité suspecte',
    badge: { label: 'Critique', color: 'red' as const },
  },
  {
    id: '2',
    title: 'Contenu inapproprié',
    description: 'Listing #456 - Images non autorisées',
    badge: { label: 'Élevé', color: 'amber' as const },
  },
  {
    id: '3',
    title: 'Faux profil',
    description: 'User #789 - Profil en double',
    badge: { label: 'Moyen', color: 'blue' as const },
  },
];

const pendingApprovals = [
  {
    id: '1',
    title: 'Toyota Camry 2023',
    description: 'Listing premium - Besoin de vérification',
    badge: { label: 'Attente', color: 'amber' as const },
  },
  {
    id: '2',
    title: 'BMW X5',
    description: 'Documents à vérifier',
    badge: { label: 'Attente', color: 'blue' as const },
  },
];

const onlineUsers = [
  {
    id: '1',
    title: 'Ahmed Mohammed',
    description: 'Regardant les véhicules',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    badge: { label: 'Actif', color: 'green' as const },
  },
  {
    id: '2',
    title: 'Fatima Hassan',
    description: 'Parcourant les listings',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    badge: { label: 'Actif', color: 'green' as const },
  },
  {
    id: '3',
    title: 'Mohamed Ali',
    description: 'En attente',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
    badge: { label: 'Inactif', color: 'amber' as const },
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 5234,
    activeUsers: 1892,
    onlineNow: 342,
    totalListings: 8934,
    pendingApprovals: 23,
    totalReports: 156,
    openReports: 12,
    totalRevenue: 45230,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
          <p className="text-slate-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de Bord Principal</h1>
        <p className="text-slate-400">Vue d'ensemble en temps réel de votre plateforme</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Utilisateurs Total"
          value={stats.totalUsers}
          change={12.5}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatCard
          label="Utilisateurs Actifs"
          value={stats.activeUsers}
          change={8.2}
          icon={<Activity size={24} />}
          color="green"
        />
        <StatCard
          label="En Ligne Maintenant"
          value={stats.onlineNow}
          change={-3.1}
          icon={<Clock size={24} />}
          color="purple"
        />
        <StatCard
          label="Revenus Aujourd'hui"
          value={`${stats.totalRevenue}$`}
          change={15.3}
          icon={<CreditCard size={24} />}
          color="amber"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Listings Actifs"
          value={stats.totalListings}
          change={5.2}
          icon={<ShoppingCart size={24} />}
          color="green"
        />
        <StatCard
          label="Approbations en Attente"
          value={stats.pendingApprovals}
          change={-2.3}
          icon={<TrendingUp size={24} />}
          color="amber"
        />
        <StatCard
          label="Signalements Ouverts"
          value={stats.openReports}
          change={8.9}
          icon={<AlertCircle size={24} />}
          color="red"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartContainer title="Revenus & Commissions" description="Derniers 7 jours">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
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
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Users Chart */}
        <ChartContainer title="Croissance des Utilisateurs" description="Derniers 7 jours">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersData}>
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
              <Bar dataKey="activeUsers" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="newUsers" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listing Types */}
        <ChartContainer title="Distribution des Listings">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={listingTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {listingTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Utilisateurs En Ligne */}
        <ChartContainer title="Utilisateurs En Ligne" description={`${stats.onlineNow} actifs maintenant`}>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <ListItem key={user.id} {...user} />
            ))}
          </div>
        </ChartContainer>

        {/* Recent Activity */}
        <ChartContainer title="Activité Récente">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm text-white">50 nouveaux listings</p>
                <p className="text-xs text-slate-500">Il y a 5 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="flex-1">
                <p className="text-sm text-white">3 signalements reçus</p>
                <p className="text-xs text-slate-500">Il y a 12 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm text-white">Payout de 5000$</p>
                <p className="text-xs text-slate-500">Il y a 28 minutes</p>
              </div>
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <ChartContainer title="Signalements Récents" description={`${stats.openReports} ouverts`}>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <ListItem key={report.id} {...report} />
            ))}
          </div>
        </ChartContainer>

        {/* Pending Approvals */}
        <ChartContainer title="Approbations en Attente" description={`${stats.pendingApprovals} à approuver`}>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <ListItem key={approval.id} {...approval} />
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
