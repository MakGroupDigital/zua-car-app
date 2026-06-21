'use client';

import { useState } from 'react';
import { ChartContainer, StatCard, Pagination } from '../components/stat-card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Zap } from 'lucide-react';

const revenueData = [
  { date: '01', revenue: 4200, payouts: 2100, fees: 2100 },
  { date: '02', revenue: 5300, payouts: 2650, fees: 2650 },
  { date: '03', revenue: 3900, payouts: 1950, fees: 1950 },
  { date: '04', revenue: 6100, payouts: 3050, fees: 3050 },
  { date: '05', revenue: 5800, payouts: 2900, fees: 2900 },
  { date: '06', revenue: 7200, payouts: 3600, fees: 3600 },
  { date: '07', revenue: 8100, payouts: 4050, fees: 4050 },
];

const paymentMethodsData = [
  { name: 'CinetPay', value: 40, fill: '#f59e0b' },
  { name: 'Carte Crédit', value: 35, fill: '#3b82f6' },
  { name: 'Mobile Money', value: 20, fill: '#10b981' },
  { name: 'Autres', value: 5, fill: '#8b5cf6' },
];

const transactionsData = [
  {
    id: '1',
    userId: 'user_1',
    type: 'Commission',
    amount: 450,
    status: 'completed',
    date: '2024-01-20',
    paymentMethod: 'CinetPay',
  },
  {
    id: '2',
    userId: 'user_2',
    type: 'Listing Fee',
    amount: 50,
    status: 'completed',
    date: '2024-01-20',
    paymentMethod: 'Carte Crédit',
  },
  {
    id: '3',
    userId: 'user_3',
    type: 'Payout',
    amount: -2000,
    status: 'pending',
    date: '2024-01-20',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: '4',
    userId: 'user_4',
    type: 'Refund',
    amount: -100,
    status: 'completed',
    date: '2024-01-19',
    paymentMethod: 'CinetPay',
  },
];

export default function FinancesDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedTransactions = transactionsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRevenue = 40800;
  const totalPayouts = 20400;
  const totalFees = 20400;
  const pendingPayouts = 8500;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion Finances</h1>
        <p className="text-slate-400 mt-1">Suivi des revenus, transactions et payouts</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Revenu Total (7 jours)"
          value={`$${totalRevenue}`}
          change={12.5}
          icon={<DollarSign size={24} />}
          color="amber"
        />
        <StatCard
          label="Commissions Collectées"
          value={`$${totalFees}`}
          change={8.2}
          icon={<CreditCard size={24} />}
          color="blue"
        />
        <StatCard
          label="Payouts Totaux"
          value={`$${totalPayouts}`}
          change={-2.3}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          label="Payouts en Attente"
          value={`$${pendingPayouts}`}
          change={5.1}
          icon={<Zap size={24} />}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartContainer title="Revenus & Payouts (7 jours)">
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
              <Line type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Payment Methods */}
        <ChartContainer title="Méthodes de Paiement">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Transactions Table */}
      <ChartContainer title="Transactions Récentes">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Type</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Montant</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Méthode</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">#{transaction.id}</td>
                  <td className="px-4 py-3 text-slate-400">{transaction.type}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''} ${transaction.amount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : transaction.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {transaction.status === 'completed' ? 'Complété' : transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{transaction.paymentMethod}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={Math.ceil(transactionsData.length / itemsPerPage)} onPageChange={setCurrentPage} />
      </ChartContainer>
    </div>
  );
}
