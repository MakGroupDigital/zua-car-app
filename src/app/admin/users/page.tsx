'use client';

import { useMemo, useState } from 'react';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Ban, Download, Lock, Search, Shield, UserCheck } from 'lucide-react';
import { UserRole } from '@/types/admin';
import { ChartContainer, Pagination, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type AdminUserRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  photoURL?: string;
  status?: 'active' | 'suspended' | 'banned' | 'inactive' | 'pending_verification';
  role?: UserRole | 'user' | 'seller' | 'support' | 'moderator' | 'admin' | 'super_admin';
  createdAt?: any;
  updatedAt?: any;
  isVerified?: boolean;
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  banned: 'Banni',
  inactive: 'Inactif',
  pending_verification: 'En attente',
};

const statusClasses: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  suspended: 'bg-amber-500/20 text-amber-400',
  banned: 'bg-red-500/20 text-red-400',
  inactive: 'bg-slate-500/20 text-slate-400',
  pending_verification: 'bg-blue-500/20 text-blue-400',
};

const roleLabels: Record<string, string> = {
  user: 'Utilisateur',
  seller: 'Vendeur',
  support: 'Support',
  moderator: 'Modérateur',
  admin: 'Admin',
  super_admin: 'Super admin',
};

function displayName(user: AdminUserRow) {
  return user.displayName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Utilisateur';
}

function formatDate(value: any) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : value instanceof Date ? value : null;
  return date ? date.toLocaleDateString('fr-FR') : '—';
}

export default function UsersManagement() {
  const firestore = useFirestore();
  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading } = useCollection<AdminUserRow>(usersRef);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const normalizedUsers = useMemo(() => (users || []).map((user) => ({
    ...user,
    status: user.status || 'active',
  })), [users]);

  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter((user) => {
      const text = `${displayName(user)} ${user.email || ''} ${user.phoneNumber || user.phone || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedUsers, searchTerm, statusFilter]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const updateUserStatus = async (userId: string, status: AdminUserRow['status']) => {
    if (!firestore || !status) return;
    setUpdatingId(userId);
    try {
      await updateDoc(doc(firestore, 'users', userId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!firestore) return;
    setUpdatingId(userId);
    try {
      await updateDoc(doc(firestore, 'users', userId), {
        role,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Chargement des utilisateurs Firebase...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="mt-1 text-slate-400">Utilisateurs réels depuis la collection Firestore `users`</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-amber-400">
          <Download size={18} />
          Exporter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={normalizedUsers.length} icon={<Shield size={24} />} color="blue" />
        <StatCard label="Actifs" value={normalizedUsers.filter((u) => u.status === 'active').length} icon={<UserCheck size={24} />} color="green" />
        <StatCard label="Suspendus" value={normalizedUsers.filter((u) => u.status === 'suspended').length} icon={<Lock size={24} />} color="amber" />
        <StatCard label="Bannis" value={normalizedUsers.filter((u) => u.status === 'banned').length} icon={<Ban size={24} />} color="red" />
      </div>

      <ChartContainer title="Recherche et filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'suspended', 'banned', 'inactive', 'pending_verification'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  statusFilter === status ? 'bg-amber-500 text-white' : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Tous' : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      <ChartContainer title={`Utilisateurs (${filteredUsers.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Utilisateur</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Téléphone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Rôle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Inscription</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-white">
                          {displayName(user).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{displayName(user)}</p>
                        <p className="text-xs text-slate-500">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{user.email || '—'}</td>
                  <td className="px-4 py-4 text-slate-300">{user.phoneNumber || user.phone || '—'}</td>
                  <td className="px-4 py-4">
                    <select
                      value={user.role || 'user'}
                      disabled={updatingId === user.id}
                      onChange={(event) => updateUserRole(user.id, event.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white disabled:opacity-60"
                    >
                      {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>{roleLabels[role] || role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[user.status || 'active']}`}>
                      {statusLabels[user.status || 'active']}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={updatingId === user.id}
                        onClick={() => updateUserStatus(user.id, user.status === 'suspended' ? 'active' : 'suspended')}
                        className="rounded-lg border border-amber-500/30 px-3 py-1 text-sm text-amber-400 disabled:opacity-60"
                      >
                        {user.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                      </button>
                      <button
                        disabled={updatingId === user.id}
                        onClick={() => updateUserStatus(user.id, user.status === 'banned' ? 'active' : 'banned')}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-sm text-red-400 disabled:opacity-60"
                      >
                        {user.status === 'banned' ? 'Débannir' : 'Bannir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </ChartContainer>
    </div>
  );
}
